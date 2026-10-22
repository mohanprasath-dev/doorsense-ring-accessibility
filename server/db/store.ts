import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { NormalizedEvent, InterpretedEvent } from '../classifier/types.js';

export interface EventStoreConfig {
	dbPath?: string;
	retentionDays?: number;
}

export class EventStore {
	private db: Database.Database;

	constructor(config: EventStoreConfig = {}) {
		const targetPath = config.dbPath || path.resolve(process.cwd(), 'doorsense.sqlite');
		const dir = path.dirname(targetPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		this.db = new Database(targetPath);
		this.initSchema();
		this.pruneOld(config.retentionDays || 1);
	}

	private initSchema(): void {
		this.db.pragma('journal_mode = WAL');
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS normalized_events (
				id TEXT PRIMARY KEY,
				source TEXT NOT NULL,
				source_event_id TEXT,
				type TEXT NOT NULL,
				occurred_at TEXT NOT NULL,
				location TEXT NOT NULL,
				metadata TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE IF NOT EXISTS interpreted_events (
				id TEXT PRIMARY KEY,
				normalized_event_id TEXT NOT NULL,
				category TEXT NOT NULL,
				confidence TEXT NOT NULL,
				explanation TEXT NOT NULL,
				evidence TEXT NOT NULL,
				next_action TEXT NOT NULL,
				occurred_at TEXT NOT NULL,
				group_count INTEGER NOT NULL,
				location TEXT NOT NULL,
				event_type TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE INDEX IF NOT EXISTS idx_norm_occurred ON normalized_events(occurred_at);
			CREATE INDEX IF NOT EXISTS idx_interp_occurred ON interpreted_events(occurred_at);
		`);
	}

	public saveEvent(norm: NormalizedEvent, interp: InterpretedEvent): void {
		const insertNorm = this.db.prepare(`
			INSERT OR REPLACE INTO normalized_events (
				id, source, source_event_id, type, occurred_at, location, metadata
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		const insertInterp = this.db.prepare(`
			INSERT OR REPLACE INTO interpreted_events (
				id, normalized_event_id, category, confidence, explanation, evidence, next_action, occurred_at, group_count, location, event_type
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		const tx = this.db.transaction(() => {
			insertNorm.run(
				norm.id,
				norm.source,
				norm.sourceEventId ?? null,
				norm.type,
				norm.occurredAt,
				norm.location,
				JSON.stringify(norm.metadata)
			);

			insertInterp.run(
				interp.id,
				interp.normalizedEventId,
				interp.category,
				interp.confidence,
				interp.explanation,
				JSON.stringify(interp.evidence),
				interp.nextAction,
				interp.occurredAt,
				interp.groupCount,
				interp.location,
				interp.eventType
			);
		});

		tx();
	}

	public getRecentInterpretedEvents(limit: number = 50): InterpretedEvent[] {
		const stmt = this.db.prepare(`
			SELECT id, normalized_event_id as normalizedEventId, category, confidence, explanation, evidence, next_action as nextAction, occurred_at as occurredAt, group_count as groupCount, location, event_type as eventType
			FROM interpreted_events
			ORDER BY occurred_at DESC
			LIMIT ?
		`);

		const rows = stmt.all(limit) as any[];
		return rows.map((r) => ({
			...r,
			evidence: JSON.parse(r.evidence || '[]'),
		}));
	}

	public pruneOld(days: number = 1): void {
		const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
		this.db.prepare('DELETE FROM normalized_events WHERE occurred_at < ?').run(cutoff);
		this.db.prepare('DELETE FROM interpreted_events WHERE occurred_at < ?').run(cutoff);
	}

	public close(): void {
		this.db.close();
	}
}
