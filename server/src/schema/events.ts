import { pgSchema, text, timestamp, uuid, numeric, pgEnum, index, jsonb } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');

export const eventTypeEnum = pgEnum('event_type', ['Event','Committee Meeting','Conference','YPAA Meeting','Other']);
export const statusEnum = pgEnum('status', ['pending','approved','rejected']);

export const events = appSchema.table('events', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	event_type: eventTypeEnum('event_type').notNull(),
	committee: text('committee'),
	committee_slug: text('committee_slug'),
	description: text('description'),
	address: text('address'),
	city: text('city'),
	state_prov: text('state_prov'),
	country: text('country'),
	postal: text('postal'),
	latitude: numeric('latitude'),
	longitude: numeric('longitude'),
	flyer_url: text('flyer_url'),
	website_url: text('website_url'),
	contact_email: text('contact_email'),
	contact_phone: text('contact_phone'),
	image_urls: jsonb('image_urls').$type<string[]>().default([]),
	status: statusEnum('status').notNull().default('pending'),
	starts_at_utc: timestamp('starts_at_utc', { withTimezone: true }),
	ends_at_utc: timestamp('ends_at_utc', { withTimezone: true }),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (t) => {
	return {
		statusEndsIdx: index('events_status_ends_idx').on(t.status, t.ends_at_utc),
		committeeStatusEndsIdx: index('events_committee_status_ends_idx').on(t.committee_slug, t.status, t.ends_at_utc),
	};
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
