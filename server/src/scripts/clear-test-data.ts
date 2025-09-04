import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';

async function clearTestData() {
  console.log('🧹 Starting complete data cleanup...');

  const db = await getDatabase(getDatabaseUrl());

  try {
    // Clear all data in reverse dependency order
    console.log('🗑️  Deleting all flags...');
    await db.delete(schema.flags);

    console.log('🗑️  Deleting all ratelimits...');
    await db.delete(schema.ratelimits);

    console.log('🗑️  Deleting all occurrences...');
    await db.delete(schema.occurrences);

    console.log('🗑️  Deleting all conferences...');
    await db.delete(schema.conferences);

    console.log('🗑️  Deleting all events...');
    await db.delete(schema.events);

    console.log('🗑️  Deleting all series...');
    await db.delete(schema.series);

    console.log('🗑️  Deleting all users...');
    await db.delete(schema.users);

    console.log('🗑️  Deleting all committees...');
    await db.delete(schema.committees);

    console.log('\n✅ Complete data cleanup finished!');
    console.log('📊 All tables have been cleared and are ready for fresh seeding.');

  } catch (error) {
    console.error('❌ Data cleanup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the cleanup
clearTestData().catch((error) => {
  console.error('💥 Cleanup failed:', error);
  process.exit(1);
});
