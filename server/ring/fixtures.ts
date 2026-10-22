import type { RawRingPayload } from '../classifier/types.js';

/**
 * TEST-ONLY FIXTURES
 * Used for deterministic automated unit tests, integration tests, and simulator playback.
 * All fixtures are synthetic and do not contain private personal identifiers or production tokens.
 */

export const TEST_FIXTURE_RING_PACKAGE_DELIVERY: RawRingPayload = {
	id: 'ding-delivery-9821',
	kind: 'ding',
	state: 'ringing',
	doorbot_id: 489201,
	device_name: 'Front Door',
	created_at: new Date(Date.now() - 1000 * 15).toISOString(),
	package_detected: true,
	person_detected: true,
	description: 'Ring Doorbell detected motion and package event at Front Door',
	location: 'Front Door',
	ding: {
		id: 'ding-delivery-9821',
		doorbot_id: 489201,
		kind: 'ding',
		state: 'ringing',
		detection_type: 'package',
		device_name: 'Front Door',
		cv_properties: {
			package_carrier_hint: 'package_detected',
		},
	},
};

export const TEST_FIXTURE_RING_FAMILIAR_CONTEXT: RawRingPayload = {
	id: 'ding-familiar-7734',
	kind: 'ding',
	state: 'ringing',
	doorbot_id: 489201,
	device_name: 'Front Door',
	created_at: new Date().toISOString(),
	person_detected: true,
	familiar_match_hint: 'caregiver_routine_window',
	description: 'Ring Doorbell motion at scheduled caregiver arrival window',
	location: 'Front Door',
	ding: {
		id: 'ding-familiar-7734',
		doorbot_id: 489201,
		kind: 'ding',
		state: 'ringing',
		detection_type: 'person',
		device_name: 'Front Door',
	},
};

export const TEST_FIXTURE_RING_UNCLASSIFIED_MOTION: RawRingPayload = {
	id: 'ding-motion-1102',
	kind: 'motion',
	state: 'active',
	doorbot_id: 489201,
	device_name: 'Side Yard Camera',
	created_at: new Date().toISOString(),
	person_detected: false,
	package_detected: false,
	description: 'Ring Camera detected peripheral motion with low certainty',
	location: 'Side Yard Camera',
	ding: {
		id: 'ding-motion-1102',
		doorbot_id: 489201,
		kind: 'motion',
		state: 'active',
		detection_type: 'motion_unspecified',
		device_name: 'Side Yard Camera',
	},
};

export const TEST_FIXTURE_RING_PERSON_DETECTED: RawRingPayload = {
	id: 'ding-person-4421',
	kind: 'motion',
	state: 'active',
	doorbot_id: 489201,
	device_name: 'Front Doorbell Pro',
	created_at: new Date().toISOString(),
	person_detected: true,
	package_detected: false,
	description: 'Ring Doorbell detected a person at Front Doorbell Pro',
	location: 'Front Doorbell Pro',
	ding: {
		id: 'ding-person-4421',
		doorbot_id: 489201,
		kind: 'motion',
		state: 'active',
		detection_type: 'person',
		device_name: 'Front Doorbell Pro',
	},
};

export const TEST_FIXTURE_RING_MALFORMED: Record<string, unknown> = {
	corrupted_field: 12345,
	invalid_date: 'not-a-date',
};
