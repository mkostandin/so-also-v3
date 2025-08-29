import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';
import * as schema from '../schema';

async function resetDatabase() {
  console.log('💥 Starting database reset...');
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('   Press Ctrl+C within 5 seconds to cancel...');

  // Add a delay to allow user to cancel
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n🗑️  Proceeding with database reset...\n');

  const db = await getDatabase(getDatabaseUrl());

  try {
    // Delete all data in reverse dependency order
    console.log('🗑️  Deleting flags...');
    await db.delete(schema.flags);

    console.log('🗑️  Deleting ratelimits...');
    await db.delete(schema.ratelimits);

    console.log('🗑️  Deleting occurrences...');
    await db.delete(schema.occurrences);

    console.log('🗑️  Deleting conferences...');
    await db.delete(schema.conferences);

    console.log('🗑️  Deleting events...');
    await db.delete(schema.events);

    console.log('🗑️  Deleting series...');
    await db.delete(schema.series);

    console.log('🗑️  Deleting users...');
    await db.delete(schema.users);

    console.log('\n🎉 Database reset complete!');
    console.log('📊 All tables have been cleared.');
    console.log('\n💡 Next steps:');
    console.log('• Run: pnpm run seed:test-data');
    console.log('• Or restart with fresh data');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the reset
resetDatabase().catch((error) => {
  console.error('💥 Reset failed:', error);
  process.exit(1);
});
