import { pgSchema, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');

export const committees = appSchema.table('committees', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(), // Normalized to ALL CAPS
	slug: text('slug').notNull(), // URL-friendly slug from normalized name
	test_data: boolean('test_data').default(false).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
	last_seen: timestamp('last_seen').defaultNow().notNull(),
}, (t) => {
	return {
		slugIdx: index('committees_slug_idx').on(t.slug),
		nameIdx: index('committees_name_idx').on(t.name),
		testDataIdx: index('committees_test_data_idx').on(t.test_data),
	};
});

export type Committee = typeof committees.$inferSelect;
export type NewCommittee = typeof committees.$inferInsert;



