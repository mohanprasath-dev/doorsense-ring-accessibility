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

export type ThemeMode = 'light' | 'dark' | 'contrast';

export interface FamiliarRoutineWindow {
	id: string;
	label: string;
	startHour: number;
	endHour: number;
	days: string;
}

export interface UserPreferences {
	theme: ThemeMode;
	soundEnabled: boolean; // OFF by default
	chimeVolume: number; // 0 to 100
	visualStrobe: boolean; // Subtle perimeter light flash for deaf residents
	largeFont: boolean;
	autoDismissSeconds: number;
	routineWindows: FamiliarRoutineWindow[];
}

export interface RingDeviceStatus {
	id: string;
	name: string;
	kind: 'doorbell' | 'camera';
	battery: number;
	wifiSignal: string;
	status: 'online' | 'offline' | 'degraded';
	firmware: string;
	lastHealthCheck: string;
}
