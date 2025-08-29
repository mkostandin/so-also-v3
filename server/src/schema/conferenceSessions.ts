import { pgSchema, text, timestamp, uuid, pgEnum, index } from 'drizzle-orm/pg-core';
import { asc } from 'drizzle-orm';
import { conferences } from './conferences';

export const appSchema = pgSchema('app');
export const sessionTypeEnum = pgEnum('session_type', ['workshop','panel','main','marathon','dance','event','main_meeting']);
export const statusEnum = pgEnum('status', ['pending','approved','rejected']);

export const conferenceSessions = appSchema.table('conference_sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	conference_id: uuid('conference_id').notNull().references(() => conferences.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	type: sessionTypeEnum('type').notNull(),
	room: text('room'),
	desc: text('desc'),
	starts_at_utc: timestamp('starts_at_utc', { withTimezone: true }),
	ends_at_utc: timestamp('ends_at_utc', { withTimezone: true }),
	status: statusEnum('status').notNull().default('pending'),
}, (t) => ({
	confStartIdx: index('conf_sessions_conf_start_idx').on(t.conference_id, asc(t.starts_at_utc))
}));

export type ConferenceSession = typeof conferenceSessions.$inferSelect;
export type NewConferenceSession = typeof conferenceSessions.$inferInsert;
