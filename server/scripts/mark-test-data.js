/**
 * Script to mark all data as test data
 * Sets test_data = true for all events and committees
 */

import { getDatabase, testDatabaseConnection } from '../src/lib/db.js';
import { getDatabaseUrl } from '../src/lib/env.js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/schema/index.js';

async function markAsTestData() {
  console.log('🔄 Connecting to database...');

  const db = await getDatabase(getDatabaseUrl());

  try {
    console.log('📊 Checking current data state...');

    // Check current counts
    const eventCounts = await db.$count(schema.events);
    const committeeCounts = await db.$count(schema.committees);

    console.log(`📈 Found ${eventCounts} events and ${committeeCounts} committees`);

    // Update events to mark as test data
    console.log('🔄 Marking events as test data...');
    await db.update(schema.events)
      .set({ test_data: true })
      .where(eq(schema.events.test_data, false));

    // Update committees to mark as test data
    console.log('🔄 Marking committees as test data...');
    await db.update(schema.committees)
      .set({ test_data: true })
      .where(eq(schema.committees.test_data, false));

    // Verify the changes
    console.log('✅ Verifying changes...');

    const updatedEventCounts = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.test_data, true));

    const updatedCommitteeCounts = await db
      .select()
      .from(schema.committees)
      .where(eq(schema.committees.test_data, true));

    console.log(`📊 Updated ${updatedEventCounts.length} events to test_data = true`);
    console.log(`📊 Updated ${updatedCommitteeCounts.length} committees to test_data = true`);

    console.log('✅ All data successfully marked as test data!');

  } catch (error) {
    console.error('❌ Error marking data as test data:', error);
    process.exit(1);
  }
}

// Run the script
markAsTestData().catch(console.error);
