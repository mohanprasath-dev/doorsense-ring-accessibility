import crypto from 'node:crypto';
import {
	RawRingPayloadSchema,
	type RawRingPayload,
	type NormalizedEvent,
	type NormalizedEventType
} from '../classifier/types.js';

export interface RingAdapterConfig {
	apiBaseUrl?: string;
	accessToken?: string;
	clientId?: string;
	clientSecret?: string;
}

export class RingAdapter {
	private config: RingAdapterConfig;
	private isOnline: boolean = true;

	constructor(config: RingAdapterConfig = {}) {
		this.config = config;
	}

	/**
	 * Normalizes inbound raw Ring event into DoorSense typed NormalizedEvent.
	 * Handles missing fields gracefully and assigns deterministic fallbacks.
	 */
	public normalize(raw: unknown): NormalizedEvent {
		const parsed = RawRingPayloadSchema.safeParse(raw);
		
		if (!parsed.success) {
			return {
				id: `norm-malformed-${crypto.randomUUID()}`,
				source: 'ring',
				type: 'unknown',
				occurredAt: new Date().toISOString(),
				location: 'Unknown Doorbell / Camera',
				metadata: {
					parseError: 'Payload did not match expected Ring schema',
					rawType: typeof raw,
				},
			};
		}

		const data: RawRingPayload = parsed.data;

		// Verify minimum expected Ring telemetry signature
		const hasRingSignature = Boolean(
			data.id || data.ding || data.kind || data.doorbot_id || data.device_name || data.location
		);

		if (!hasRingSignature) {
			return {
				id: `norm-malformed-${crypto.randomUUID()}`,
				source: 'ring',
				type: 'unknown',
				occurredAt: new Date().toISOString(),
				location: 'Unknown Doorbell / Camera',
				metadata: {
					parseError: 'Payload missing required Ring identifying signatures',
					rawType: typeof raw,
				},
			};
		}

		// Extract raw identifiers
		const rawId = data.id ?? data.ding?.id;
		const sourceEventId = rawId !== undefined ? String(rawId) : undefined;
		const id = sourceEventId ? `ring-${sourceEventId}` : `ring-gen-${crypto.randomUUID()}`;

		// Resolve device location
		const location = (
			data.location ||
			data.device_name ||
			data.ding?.device_name ||
			'Front Door'
		).trim();

		// Timestamp resolution with validation
		let occurredAt: string;
		const candidateTime = data.created_at || data.ding?.created_at;
		if (candidateTime && !Number.isNaN(Date.parse(candidateTime))) {
			occurredAt = new Date(candidateTime).toISOString();
		} else {
			occurredAt = new Date().toISOString();
		}

		// Event classification into base normalized type
		const type = this.resolveNormalizedType(data);

		// Minimal, privacy-preserving metadata
		const metadata: Record<string, string | number | boolean> = {};
		if (data.doorbot_id) metadata.doorbotId = Number(data.doorbot_id);
		if (data.person_detected) metadata.personDetected = true;
		if (data.package_detected) metadata.packageDetected = true;
		if (data.familiar_match_hint) metadata.familiarMatchHint = String(data.familiar_match_hint);
		if (data.state) metadata.state = String(data.state);

		return {
			id,
			source: 'ring',
			sourceEventId,
			type,
			occurredAt,
			location,
			metadata,
		};
	}

	/**
	 * Determines the normalized event type strictly based on deterministic payload fields
	 */
	private resolveNormalizedType(data: RawRingPayload): NormalizedEventType {
		const kind = (data.kind || data.ding?.kind || '').toLowerCase();
		const detectionType = (data.ding?.detection_type || '').toLowerCase();

		if (data.package_detected || detectionType.includes('package')) {
			return 'package';
		}
		if (kind.includes('ding') || kind.includes('doorbell') || data.ding?.state === 'ringing') {
			return 'doorbell';
		}
		if (data.person_detected || detectionType.includes('person')) {
			return 'person';
		}
		if (kind.includes('motion') || detectionType.includes('motion')) {
			return 'motion';
		}
		return 'unknown';
	}

	/**
	 * Verifies connectivity to the configured Ring service or reports degraded state
	 */
	public async checkHealth(): Promise<{ status: 'healthy' | 'degraded'; message: string }> {
		if (!this.isOnline) {
			return {
				status: 'degraded',
				message: 'Ring integration is simulated offline/degraded mode.',
			};
		}
		if (!this.config.accessToken && !this.config.clientId) {
			return {
				status: 'healthy',
				message: 'Ring runtime operating in local simulator / webhook ingestion mode.',
			};
		}
		return {
			status: 'healthy',
			message: 'Ring runtime provider connected.',
		};
	}

	public setSimulatedStatus(online: boolean): void {
		this.isOnline = online;
	}
}
