import { describe, it, expect } from 'vitest';
import { EventClassifier } from '../server/classifier/classifier.js';
import { EventDeduplicator } from '../server/classifier/deduplicator.js';
import { RingAdapter } from '../server/ring/adapter.js';
import { TEST_FIXTURE_RING_UNCLASSIFIED_MOTION, TEST_FIXTURE_RING_PACKAGE_DELIVERY } from '../server/ring/fixtures.js';

describe('EventDeduplicator - Time-Window Grouping', () => {
	const adapter = new RingAdapter();
	const classifier = new EventClassifier();

	it('groups rapid consecutive motion events into a single item with increased count', () => {
		const deduplicator = new EventDeduplicator(classifier, { windowMs: 5000 });
		const norm = adapter.normalize(TEST_FIXTURE_RING_UNCLASSIFIED_MOTION);

		const first = deduplicator.process(norm);
		expect(first.isNewGroup).toBe(true);
		expect(first.event.groupCount).toBe(1);

		const second = deduplicator.process({
			...norm,
			occurredAt: new Date(Date.now() + 1000).toISOString(),
		});
		expect(second.isNewGroup).toBe(false);
		expect(second.event.groupCount).toBe(2);

		const third = deduplicator.process({
			...norm,
			occurredAt: new Date(Date.now() + 2000).toISOString(),
		});
		expect(third.isNewGroup).toBe(false);
		expect(third.event.groupCount).toBe(3);
	});

	it('creates separate groups for different event types or locations', () => {
		const deduplicator = new EventDeduplicator(classifier, { windowMs: 5000 });
		const motionNorm = adapter.normalize(TEST_FIXTURE_RING_UNCLASSIFIED_MOTION);
		const packageNorm = adapter.normalize(TEST_FIXTURE_RING_PACKAGE_DELIVERY);

		const res1 = deduplicator.process(motionNorm);
		const res2 = deduplicator.process(packageNorm);

		expect(res1.isNewGroup).toBe(true);
		expect(res2.isNewGroup).toBe(true);
		expect(res1.event.category).not.toBe(res2.event.category);
	});
});
