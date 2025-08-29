import { pgSchema, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');
export const statusEnum = pgEnum('status', ['pending','approved','rejected']);

export const conferences = appSchema.table('conferences', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	city: text('city'),
	program_url: text('program_url'),
	hotel_map_url: text('hotel_map_url'),
	flyer_url: text('flyer_url'),
	website_url: text('website_url'),
	image_urls: text('image_urls').array(),
	starts_at_utc: timestamp('starts_at_utc', { withTimezone: true }),
	ends_at_utc: timestamp('ends_at_utc', { withTimezone: true }),
	status: statusEnum('status').notNull().default('pending'),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type Conference = typeof conferences.$inferSelect;
export type NewConference = typeof conferences.$inferInsert;
