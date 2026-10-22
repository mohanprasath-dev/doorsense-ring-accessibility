import { describe, it, expect } from 'vitest';
import { RingAdapter } from '../server/ring/adapter.js';
import {
	TEST_FIXTURE_RING_PACKAGE_DELIVERY,
	TEST_FIXTURE_RING_FAMILIAR_CONTEXT,
	TEST_FIXTURE_RING_UNCLASSIFIED_MOTION,
	TEST_FIXTURE_RING_PERSON_DETECTED,
	TEST_FIXTURE_RING_MALFORMED
} from '../server/ring/fixtures.js';

describe('RingAdapter - Runtime Ingestion & Normalization', () => {
	const adapter = new RingAdapter();

	it('normalizes package delivery event accurately', () => {
		const normalized = adapter.normalize(TEST_FIXTURE_RING_PACKAGE_DELIVERY);
		expect(normalized.source).toBe('ring');
		expect(normalized.type).toBe('package');
		expect(normalized.location).toBe('Front Door');
		expect(normalized.sourceEventId).toBe('ding-delivery-9821');
		expect(normalized.metadata.packageDetected).toBe(true);
	});

	it('normalizes familiar context event accurately', () => {
		const normalized = adapter.normalize(TEST_FIXTURE_RING_FAMILIAR_CONTEXT);
		expect(normalized.type).toBe('doorbell');
		expect(normalized.metadata.familiarMatchHint).toBe('caregiver_routine_window');
	});

	it('normalizes motion detection without person', () => {
		const normalized = adapter.normalize(TEST_FIXTURE_RING_UNCLASSIFIED_MOTION);
		expect(normalized.type).toBe('motion');
		expect(normalized.location).toBe('Side Yard Camera');
	});

	it('normalizes person detected event', () => {
		const normalized = adapter.normalize(TEST_FIXTURE_RING_PERSON_DETECTED);
		expect(normalized.type).toBe('person');
		expect(normalized.location).toBe('Front Doorbell Pro');
	});

	it('safely handles malformed and incomplete payloads without throwing', () => {
		const normalized = adapter.normalize(TEST_FIXTURE_RING_MALFORMED);
		expect(normalized.type).toBe('unknown');
		expect(normalized.metadata.parseError).toBeDefined();
	});

	it('reports healthy and degraded status on demand', async () => {
		const healthy = await adapter.checkHealth();
		expect(healthy.status).toBe('healthy');

		adapter.setSimulatedStatus(false);
		const degraded = await adapter.checkHealth();
		expect(degraded.status).toBe('degraded');
		expect(degraded.message).toContain('offline/degraded');

		adapter.setSimulatedStatus(true);
	});
});
