import { describe, it, expect } from 'vitest';
import { EventClassifier } from '../server/classifier/classifier.js';
import { RingAdapter } from '../server/ring/adapter.js';
import {
	TEST_FIXTURE_RING_PACKAGE_DELIVERY,
	TEST_FIXTURE_RING_FAMILIAR_CONTEXT,
	TEST_FIXTURE_RING_UNCLASSIFIED_MOTION,
	TEST_FIXTURE_RING_PERSON_DETECTED
} from '../server/ring/fixtures.js';

describe('EventClassifier - Conservative Deterministic Interpretation', () => {
	const adapter = new RingAdapter();
	const classifier = new EventClassifier();

	it('classifies package event as Possible delivery with higher confidence', () => {
		const norm = adapter.normalize(TEST_FIXTURE_RING_PACKAGE_DELIVERY);
		const result = classifier.classify(norm);

		expect(result.category).toBe('Possible delivery');
		expect(result.confidence).toBe('higher');
		expect(result.evidence.length).toBeGreaterThan(0);
		expect(result.nextAction).toBeDefined();
		// Must not claim certainty
		expect(result.explanation.toLowerCase()).not.toContain('confirmed delivered');
	});

	it('classifies familiar context as Possible familiar-context match with limited confidence', () => {
		const norm = adapter.normalize(TEST_FIXTURE_RING_FAMILIAR_CONTEXT);
		const result = classifier.classify(norm);

		expect(result.category).toBe('Possible familiar-context match');
		expect(result.confidence).toBe('limited');
		expect(result.explanation).toContain('Identity is not guaranteed');
	});

	it('classifies motion event without person as Motion detected, person not confirmed', () => {
		const norm = adapter.normalize(TEST_FIXTURE_RING_UNCLASSIFIED_MOTION);
		const result = classifier.classify(norm);

		expect(result.category).toBe('Motion detected, person not confirmed');
		expect(result.confidence).toBe('limited');
		expect(result.nextAction).toBe('No immediate action required.');
	});

	it('classifies person event with unknown identity', () => {
		const norm = adapter.normalize(TEST_FIXTURE_RING_PERSON_DETECTED);
		const result = classifier.classify(norm);

		expect(result.category).toBe('Person detected, identity unknown');
		expect(result.confidence).toBe('limited');
		expect(result.explanation).toContain('Identity and intent are unverified');
	});

	it('falls back to Unclassified event for ambiguous signals', () => {
		const norm = adapter.normalize({ id: 'dummy-999', kind: 'raw_ping' });
		const result = classifier.classify(norm);

		expect(result.category).toBe('Unclassified event');
		expect(result.confidence).toBe('unknown');
	});

	it('strictly avoids forbidden terms like danger, emergency, intruder, criminal, safe', () => {
		const testPayloads = [
			TEST_FIXTURE_RING_PACKAGE_DELIVERY,
			TEST_FIXTURE_RING_FAMILIAR_CONTEXT,
			TEST_FIXTURE_RING_UNCLASSIFIED_MOTION,
			TEST_FIXTURE_RING_PERSON_DETECTED,
		];

		const forbiddenWords = ['danger', 'threat', 'emergency', 'intruder', 'criminal', 'guaranteed safe'];

		for (const payload of testPayloads) {
			const norm = adapter.normalize(payload);
			const result = classifier.classify(norm);
			const fullText = `${result.category} ${result.explanation} ${result.nextAction}`.toLowerCase();

			for (const word of forbiddenWords) {
				expect(fullText).not.toContain(word);
			}
		}
	});
});
