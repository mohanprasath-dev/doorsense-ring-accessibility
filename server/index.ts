import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { RingAdapter } from './ring/adapter.js';
import { EventClassifier } from './classifier/classifier.js';
import { EventDeduplicator } from './classifier/deduplicator.js';
import { EventStore } from './db/store.js';
import {
	TEST_FIXTURE_RING_PACKAGE_DELIVERY,
	TEST_FIXTURE_RING_FAMILIAR_CONTEXT,
	TEST_FIXTURE_RING_UNCLASSIFIED_MOTION,
	TEST_FIXTURE_RING_PERSON_DETECTED
} from './ring/fixtures.js';
import type { InterpretedEvent } from './classifier/types.js';

dotenv.config();

const port = Number(process.env.PORT) || 8787;
const host = '0.0.0.0';

export function createServer() {
	const app = Fastify({
		logger: {
			level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
		},
	});

	app.register(cors, {
		origin: true,
	});

	const ringAdapter = new RingAdapter({
		apiBaseUrl: process.env.RING_API_BASE_URL,
		accessToken: process.env.RING_ACCESS_TOKEN,
		clientId: process.env.RING_CLIENT_ID,
		clientSecret: process.env.RING_CLIENT_SECRET,
	});

	const classifier = new EventClassifier();
	const deduplicator = new EventDeduplicator(classifier, { windowMs: 60_000 });
	const store = new EventStore({
		retentionDays: Number(process.env.EVENT_RETENTION_DAYS) || 1,
	});

	// Active SSE client connections
	const sseClients = new Set<(eventData: string) => void>();

	const broadcastEvent = (interpreted: InterpretedEvent) => {
		const payload = `data: ${JSON.stringify(interpreted)}\n\n`;
		for (const send of sseClients) {
			send(payload);
		}
	};

	// 1. Health check
	app.get('/api/health', async () => {
		const health = await ringAdapter.checkHealth();
		return {
			service: 'DoorSense Backend',
			status: health.status,
			ringProvider: health.message,
			timestamp: new Date().toISOString(),
		};
	});

	// 2. Fetch event history
	app.get('/api/events', async (req) => {
		const query = req.query as { limit?: string };
		const limit = query.limit ? Number(query.limit) : 50;
		const events = store.getRecentInterpretedEvents(limit);
		return { events };
	});

	// 3. Server-Sent Events (SSE) live stream
	app.get('/api/events/stream', async (req, reply) => {
		reply.raw.setHeader('Content-Type', 'text/event-stream');
		reply.raw.setHeader('Cache-Control', 'no-cache');
		reply.raw.setHeader('Connection', 'keep-alive');
		reply.raw.flushHeaders();

		const listener = (data: string) => {
			reply.raw.write(data);
		};

		sseClients.add(listener);

		req.raw.on('close', () => {
			sseClients.delete(listener);
		});

		// Send initial keep-alive comment
		reply.raw.write(': connected to doorsense stream\n\n');
	});

	// 4. Ingest real Ring webhook events
	app.post('/api/ring/webhook', async (req, reply) => {
		const rawPayload = req.body;
		const normalized = ringAdapter.normalize(rawPayload);
		const { event: interpreted } = deduplicator.process(normalized);

		store.saveEvent(normalized, interpreted);
		broadcastEvent(interpreted);

		return reply.code(200).send({
			status: 'accepted',
			normalizedId: normalized.id,
			interpretedCategory: interpreted.category,
			groupCount: interpreted.groupCount,
		});
	});

	// 5. Simulator trigger endpoint
	app.post('/api/ring/simulate', async (req, reply) => {
		const body = req.body as { scenario?: string; customPayload?: unknown; count?: number };
		const scenario = body.scenario || 'delivery';
		const count = Math.min(Math.max(body.count || 1, 1), 10);

		let basePayload: any;
		if (body.customPayload) {
			basePayload = body.customPayload;
		} else {
			switch (scenario) {
				case 'delivery':
					basePayload = {
						...TEST_FIXTURE_RING_PACKAGE_DELIVERY,
						created_at: new Date().toISOString(),
					};
					break;
				case 'familiar':
					basePayload = {
						...TEST_FIXTURE_RING_FAMILIAR_CONTEXT,
						created_at: new Date().toISOString(),
					};
					break;
				case 'unclassified':
					basePayload = {
						...TEST_FIXTURE_RING_UNCLASSIFIED_MOTION,
						created_at: new Date().toISOString(),
					};
					break;
				case 'person':
					basePayload = {
						...TEST_FIXTURE_RING_PERSON_DETECTED,
						created_at: new Date().toISOString(),
					};
					break;
				default:
					return reply.code(400).send({ error: `Unknown scenario '${scenario}'` });
			}
		}

		const results: InterpretedEvent[] = [];

		for (let i = 0; i < count; i++) {
			const payloadInstance = {
				...basePayload,
				created_at: new Date(Date.now() + i * 500).toISOString(),
			};
			const normalized = ringAdapter.normalize(payloadInstance);
			const { event: interpreted } = deduplicator.process(normalized);
			store.saveEvent(normalized, interpreted);
			broadcastEvent(interpreted);
			results.push(interpreted);
		}

		return reply.send({
			status: 'simulated',
			scenario,
			count,
			latestEvent: results[results.length - 1],
		});
	});

	// 6. Degraded mode toggle
	app.post('/api/ring/degraded', async (req) => {
		const body = req.body as { degraded?: boolean };
		const isDegraded = Boolean(body.degraded);
		ringAdapter.setSimulatedStatus(!isDegraded);

		const health = await ringAdapter.checkHealth();
		return {
			status: health.status,
			ringProvider: health.message,
		};
	});

	return { app, ringAdapter, classifier, deduplicator, store };
}

// Start server directly if run from CLI
if (process.env.NODE_ENV !== 'test') {
	const { app } = createServer();
	app.listen({ port, host }, (err, address) => {
		if (err) {
			app.log.error(err);
			process.exit(1);
		}
		console.log(`DoorSense backend running on ${address}`);
	});
}
