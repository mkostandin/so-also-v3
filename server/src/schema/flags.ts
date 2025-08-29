import { pgSchema, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');

export const flagTargetEnum = pgEnum('flag_target', ['event','conference','session','series']);
export const flagReasonEnum = pgEnum('flag_reason', ['incorrect_time','wrong_address','broken_link','duplicate','not_ypaa','inappropriate','other']);
export const flagStatusEnum = pgEnum('flag_status', ['open','resolved','dismissed']);

export const flags = appSchema.table('flags', {
	id: uuid('id').primaryKey().defaultRandom(),
	target_type: flagTargetEnum('target_type').notNull(),
	target_id: text('target_id').notNull(),
	committee_slug: text('committee_slug'),
	reason: flagReasonEnum('reason').notNull(),
	message: text('message'),
	contact_email: text('contact_email'),
	status: flagStatusEnum('status').notNull().default('open'),
	created_at: timestamp('created_at').defaultNow().notNull(),
	created_by: text('created_by'),
	device_id: text('device_id'),
});

export type Flag = typeof flags.$inferSelect;
export type NewFlag = typeof flags.$inferInsert;
