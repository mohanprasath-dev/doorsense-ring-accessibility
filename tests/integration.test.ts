import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../server/index.js';
import {
	TEST_FIXTURE_RING_PACKAGE_DELIVERY,
	TEST_FIXTURE_RING_FAMILIAR_CONTEXT
} from '../server/ring/fixtures.js';

describe('Fastify Server - End-to-End API Integration', () => {
	let server: ReturnType<typeof createServer>;

	beforeAll(async () => {
		server = createServer();
		await server.app.ready();
	});

	afterAll(async () => {
		server.store.close();
		await server.app.close();
	});

	it('GET /api/health returns healthy status', async () => {
		const res = await server.app.inject({
			method: 'GET',
			url: '/api/health',
		});

		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.status).toBe('healthy');
		expect(json.service).toContain('DoorSense');
	});

	it('POST /api/ring/webhook ingests raw Ring payload', async () => {
		const res = await server.app.inject({
			method: 'POST',
			url: '/api/ring/webhook',
			payload: TEST_FIXTURE_RING_PACKAGE_DELIVERY,
		});

		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.status).toBe('accepted');
		expect(json.interpretedCategory).toBe('Possible delivery');
		expect(json.groupCount).toBe(1);
	});

	it('POST /api/ring/simulate triggers delivery scenario and returns latest event', async () => {
		const res = await server.app.inject({
			method: 'POST',
			url: '/api/ring/simulate',
			payload: { scenario: 'delivery' },
		});

		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.status).toBe('simulated');
		expect(json.latestEvent.category).toBe('Possible delivery');
	});

	it('GET /api/events returns recorded timeline events', async () => {
		const res = await server.app.inject({
			method: 'GET',
			url: '/api/events',
		});

		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(Array.isArray(json.events)).toBe(true);
		expect(json.events.length).toBeGreaterThan(0);
	});

	it('POST /api/ring/degraded safely toggles degraded mode', async () => {
		const res = await server.app.inject({
			method: 'POST',
			url: '/api/ring/degraded',
			payload: { degraded: true },
		});

		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.status).toBe('degraded');
	});
});
