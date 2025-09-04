import { pgSchema, text, timestamp, uuid, integer, jsonb, pgEnum, numeric, boolean } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');

export const seriesTypeEnum = pgEnum('series_type', ['Committee Meeting','YPAA Meeting']);
export const statusEnum = pgEnum('status', ['pending','approved','rejected']);

export const series = appSchema.table('series', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	type: seriesTypeEnum('type').notNull(),
	committee: text('committee'),
	committee_slug: text('committee_slug'),
	timezone: text('timezone').notNull(),
	start_time_local: text('start_time_local').notNull(), // HH:mm
	duration_mins: integer('duration_mins').notNull(),
	rrule: jsonb('rrule').$type<{
		freq: 'weekly'|'monthly';
		interval: number;
		by_weekday?: string[];
		by_set_pos?: number[];
		by_month?: number[];
		until?: string | null; // date
		count?: number | null;
	}>().notNull(),
	ex_dates: jsonb('ex_dates').$type<string[] | null>(),
	overrides: jsonb('overrides').$type<Record<string, any> | null>(),
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
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
