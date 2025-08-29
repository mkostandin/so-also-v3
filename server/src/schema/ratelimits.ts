import { pgSchema, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');

export const ratelimits = appSchema.table('ratelimits', {
	key: text('key').primaryKey(),
	count: integer('count').notNull().default(0),
	reset_at: timestamp('reset_at', { withTimezone: true }).notNull(),
});

export type RateLimit = typeof ratelimits.$inferSelect;
export type NewRateLimit = typeof ratelimits.$inferInsert;
