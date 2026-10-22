import { z } from 'zod';

export const RawRingPayloadSchema = z.object({
	id: z.union([z.string(), z.number()]).optional(),
	ding: z.object({
		id: z.union([z.string(), z.number()]).optional(),
		doorbot_id: z.union([z.string(), z.number()]).optional(),
		kind: z.string().optional(),
		state: z.string().optional(),
		created_at: z.string().optional(),
		device_name: z.string().optional(),
		detection_type: z.string().optional(),
		cv_properties: z.record(z.string(), z.any()).optional(),
	}).optional(),
	kind: z.string().optional(),
	state: z.string().optional(),
	doorbot_id: z.union([z.string(), z.number()]).optional(),
	created_at: z.string().optional(),
	description: z.string().optional(),
	device_name: z.string().optional(),
	person_detected: z.boolean().optional(),
	package_detected: z.boolean().optional(),
	familiar_match_hint: z.string().optional(),
	location: z.string().optional(),
}).passthrough();

export type RawRingPayload = z.infer<typeof RawRingPayloadSchema>;

export const NormalizedEventTypeSchema = z.enum([
	'doorbell',
	'motion',
	'person',
	'package',
	'unknown'
]);

export type NormalizedEventType = z.infer<typeof NormalizedEventTypeSchema>;

export const NormalizedEventSchema = z.object({
	id: z.string(),
	source: z.literal('ring'),
	sourceEventId: z.string().optional(),
	type: NormalizedEventTypeSchema,
	occurredAt: z.string(),
	location: z.string(),
	metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;

export const InterpretationCategorySchema = z.enum([
	'Possible delivery',
	'Possible familiar-context match',
	'Person detected, identity unknown',
	'Motion detected, person not confirmed',
	'Unclassified event',
]);

export type InterpretationCategory = z.infer<typeof InterpretationCategorySchema>;

export const ConfidenceBandSchema = z.enum(['higher', 'limited', 'unknown']);
export type ConfidenceBand = z.infer<typeof ConfidenceBandSchema>;

export const InterpretedEventSchema = z.object({
	id: z.string(),
	normalizedEventId: z.string(),
	category: InterpretationCategorySchema,
	confidence: ConfidenceBandSchema,
	explanation: string(),
	evidence: z.array(z.string()),
	nextAction: z.string(),
	occurredAt: z.string(),
	groupCount: z.number().int().min(1),
	location: z.string(),
	eventType: NormalizedEventTypeSchema,
	isDegraded: z.boolean().optional(),
});

function string() {
	return z.string();
}

export type InterpretedEvent = z.infer<typeof InterpretedEventSchema>;

export interface FamiliarContactRule {
	id: string;
	label: string;
	expectedTimes?: { startHour: number; endHour: number };
	approximateDays?: number[]; // 0=Sunday, 1=Monday...
}
