import { pgSchema, text, timestamp, uuid, numeric, pgEnum, index, boolean } from 'drizzle-orm/pg-core';
import { series } from './series';

export const appSchema = pgSchema('app');
export const statusEnum = pgEnum('status', ['pending','approved','rejected']);

export const occurrences = appSchema.table('occurrences', {
	id: uuid('id').primaryKey().defaultRandom(),
	series_id: uuid('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	type: text('type').notNull(),
	committee: text('committee'),
	committee_slug: text('committee_slug'),
	starts_at_local: text('starts_at_local').notNull(),
	ends_at_local: text('ends_at_local').notNull(),
	starts_at_utc: timestamp('starts_at_utc', { withTimezone: true }).notNull(),
	ends_at_utc: timestamp('ends_at_utc', { withTimezone: true }).notNull(),
	address: text('address'),
	city: text('city'),
	state_prov: text('state_prov'),
	country: text('country'),
	postal: text('postal'),
	latitude: numeric('latitude'),
	longitude: numeric('longitude'),
	status: statusEnum('status').notNull().default('pending'),
	notify_topic: text('notify_topic'),
	test_data: boolean('test_data').notNull().default(false),
});

export const occurrencesIdx = index('occurrences_status_ends_idx').on(occurrences.status, occurrences.ends_at_utc);

export type Occurrence = typeof occurrences.$inferSelect;
export type NewOccurrence = typeof occurrences.$inferInsert;
