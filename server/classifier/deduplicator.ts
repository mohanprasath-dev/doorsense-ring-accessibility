import type { NormalizedEvent, InterpretedEvent } from './types.js';
import type { EventClassifier } from './classifier.js';

export interface DeduplicationConfig {
	windowMs?: number; // Time window to group identical events (default: 60s)
}

interface EventGroupState {
	firstSeen: number;
	lastSeen: number;
	count: number;
	latestNormalizedEvent: NormalizedEvent;
}

export class EventDeduplicator {
	private windowMs: number;
	private classifier: EventClassifier;
	private groups: Map<string, EventGroupState> = new Map();

	constructor(classifier: EventClassifier, config: DeduplicationConfig = {}) {
		this.classifier = classifier;
		this.windowMs = config.windowMs ?? 60_000;
	}

	/**
	 * Generates a deduplication key based on location, event type, and relevant hint
	 */
	private getGroupKey(event: NormalizedEvent): string {
		const hint = event.metadata.familiarMatchHint || '';
		return `${event.location}::${event.type}::${hint}`;
	}

	/**
	 * Ingests a NormalizedEvent, applies time-window grouping, and returns the InterpretedEvent.
	 */
	public process(event: NormalizedEvent): { event: InterpretedEvent; isNewGroup: boolean } {
		const key = this.getGroupKey(event);
		const now = Date.parse(event.occurredAt) || Date.now();
		const existing = this.groups.get(key);

		if (existing && now - existing.lastSeen <= this.windowMs) {
			// Increment count and update lastSeen
			existing.count += 1;
			existing.lastSeen = now;
			existing.latestNormalizedEvent = event;

			const interpreted = this.classifier.classify(event, existing.count);
			return { event: interpreted, isNewGroup: false };
		}

		// New group started
		const newState: EventGroupState = {
			firstSeen: now,
			lastSeen: now,
			count: 1,
			latestNormalizedEvent: event,
		};
		this.groups.set(key, newState);

		const interpreted = this.classifier.classify(event, 1);
		return { event: interpreted, isNewGroup: true };
	}

	/**
	 * Cleans up stale groups beyond 2x windowMs to prevent memory leak
	 */
	public pruneStale(): void {
		const now = Date.now();
		for (const [key, state] of this.groups.entries()) {
			if (now - state.lastSeen > this.windowMs * 2) {
				this.groups.delete(key);
			}
		}
	}

	public clear(): void {
		this.groups.clear();
	}
}
