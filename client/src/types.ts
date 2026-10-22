export type InterpretationCategory =
	| 'Possible delivery'
	| 'Possible familiar-context match'
	| 'Person detected, identity unknown'
	| 'Motion detected, person not confirmed'
	| 'Unclassified event';

export type ConfidenceBand = 'higher' | 'limited' | 'unknown';

export interface InterpretedEvent {
	id: string;
	normalizedEventId: string;
	category: InterpretationCategory;
	confidence: ConfidenceBand;
	explanation: string;
	evidence: string[];
	nextAction: string;
	occurredAt: string;
	groupCount: number;
	location: string;
	eventType: string;
	isDegraded?: boolean;
}

export interface UserPreferences {
	highContrast: boolean;
	soundEnabled: boolean; // OFF by default
	largeFont: boolean;
	autoDismissSeconds: number; // 0 for persistent
}
