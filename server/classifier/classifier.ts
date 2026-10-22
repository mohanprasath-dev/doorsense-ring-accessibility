import type {
	NormalizedEvent,
	InterpretedEvent,
	InterpretationCategory,
	ConfidenceBand,
	FamiliarContactRule
} from './types.js';

export class EventClassifier {
	private familiarRules: FamiliarContactRule[] = [
		{
			id: 'default-caregiver',
			label: 'Scheduled Support / Routine Visitor Window',
			expectedTimes: { startHour: 8, endHour: 18 },
		},
	];

	/**
	 * Classifies a normalized Ring event using strictly deterministic rules and cautious wording.
	 */
	public classify(event: NormalizedEvent, groupCount: number = 1): InterpretedEvent {
		const evidence: string[] = [];

		// 1. Possible delivery check
		if (
			event.type === 'package' ||
			event.metadata.packageDetected === true ||
			event.metadata.detection_type === 'package'
		) {
			evidence.push('Ring package or carrier activity flag detected');
			if (event.type === 'doorbell') {
				evidence.push('Doorbell chime accompanied activity');
			}
			return {
				id: `interp-${event.id}`,
				normalizedEventId: event.id,
				category: 'Possible delivery',
				confidence: 'higher',
				explanation: 'Package or carrier activity was flagged near the doorway.',
				evidence,
				nextAction: 'Check doorstep or entryway when convenient. No rush.',
				occurredAt: event.occurredAt,
				groupCount,
				location: event.location,
				eventType: event.type,
			};
		}

		// 2. Possible familiar-context match check
		// Note: Consent-based, explicitly non-biometric context match (e.g. routine arrival window or opt-in hint)
		if (event.metadata.familiarMatchHint) {
			evidence.push(`Context matched local routine pattern: "${event.metadata.familiarMatchHint}"`);
			if (event.type === 'doorbell') {
				evidence.push('Doorbell pressed');
			}
			return {
				id: `interp-${event.id}`,
				normalizedEventId: event.id,
				category: 'Possible familiar-context match',
				confidence: 'limited',
				explanation: 'Event corresponds with a scheduled visit window. Identity is not guaranteed.',
				evidence,
				nextAction: 'Glance through window or check screen if you are expecting someone.',
				occurredAt: event.occurredAt,
				groupCount,
				location: event.location,
				eventType: event.type,
			};
		}

		// 3. Person detected, identity unknown
		if (event.type === 'person' || event.metadata.personDetected === true) {
			evidence.push('Ring sensor flagged person shape or movement');
			return {
				id: `interp-${event.id}`,
				normalizedEventId: event.id,
				category: 'Person detected, identity unknown',
				confidence: 'limited',
				explanation: 'A person was detected at your door. Identity and intent are unverified.',
				evidence,
				nextAction: 'Check door or visual display at your convenience.',
				occurredAt: event.occurredAt,
				groupCount,
				location: event.location,
				eventType: event.type,
			};
		}

		// 4. Motion detected, person not confirmed
		if (event.type === 'motion') {
			evidence.push('Camera triggered by movement');
			evidence.push('No person or package confirmed by sensor');
			return {
				id: `interp-${event.id}`,
				normalizedEventId: event.id,
				category: 'Motion detected, person not confirmed',
				confidence: 'limited',
				explanation: 'Motion was observed nearby (could be shadows, pets, or foliage).',
				evidence,
				nextAction: 'No immediate action required.',
				occurredAt: event.occurredAt,
				groupCount,
				location: event.location,
				eventType: event.type,
			};
		}

		// 5. Doorbell with no other context
		if (event.type === 'doorbell') {
			evidence.push('Doorbell chime triggered');
			return {
				id: `interp-${event.id}`,
				normalizedEventId: event.id,
				category: 'Unclassified event',
				confidence: 'limited',
				explanation: 'Doorbell rang without associated video classification.',
				evidence,
				nextAction: 'Check entry viewer when comfortable.',
				occurredAt: event.occurredAt,
				groupCount,
				location: event.location,
				eventType: event.type,
			};
		}

		// Default fallback: Unclassified event
		evidence.push('Incomplete or low-certainty sensor telemetry');
		return {
			id: `interp-${event.id}`,
			normalizedEventId: event.id,
			category: 'Unclassified event',
			confidence: 'unknown',
			explanation: 'Sensor signal does not match high-confidence categories.',
			evidence,
			nextAction: 'Disregard unless you notice further door activity.',
			occurredAt: event.occurredAt,
			groupCount,
			location: event.location,
			eventType: event.type,
		};
	}
}
