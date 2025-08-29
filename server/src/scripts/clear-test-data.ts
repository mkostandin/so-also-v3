import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';
import { eq, or, and, like } from 'drizzle-orm';
import * as schema from '../schema';

async function clearTestData() {
  console.log('🧹 Starting test data cleanup...');

  const db = await getDatabase(getDatabaseUrl());

  // Delete test events (events with status='approved' that contain common test keywords)
  const testEventNames = [
    'NECYPAA Committee Meeting',
    'NECYPAA 35',
    'MSCYPAA 26',
    'NECYPAA Fall Festival',
    'RYAA Spring Dance',
    'CSCYPAA Committee Meeting',
    'Maine YPAA Workshop',
    'Vermont YPAA Dance',
    'Rhode Island YPAA Meeting'
  ];

  let eventsDeleted = 0;

  for (const eventName of testEventNames) {
    try {
      const result = await db.delete(schema.events)
        .where(and(
          eq(schema.events.status, 'approved'),
          eq(schema.events.name, eventName)
        ));

      if (result.rowCount && result.rowCount > 0) {
        eventsDeleted += result.rowCount;
        console.log(`✅ Deleted: ${eventName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete ${eventName}:`, error);
    }
  }

  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📊 Events deleted: ${eventsDeleted}`);

  if (eventsDeleted === 0) {
    console.log('\nℹ️  No test events found to delete.');
    console.log('   This might mean:');
    console.log('   - Test data was never seeded');
    console.log('   - Events were already deleted');
    console.log('   - Events have a different status');
  }

  console.log('\n📋 Other cleanup options:');
  console.log('• Clear all events: DELETE FROM events WHERE status = \'approved\'');
  console.log('• Clear all conferences: DELETE FROM conferences WHERE status = \'approved\'');
  console.log('• Clear all occurrences: DELETE FROM occurrences WHERE status = \'approved\'');
  console.log('• Clear all flags: DELETE FROM flags');
  console.log('• Clear all ratelimits: DELETE FROM ratelimits');

  process.exit(0);
}

// Run the cleanup
clearTestData().catch((error) => {
  console.error('💥 Cleanup failed:', error);
  process.exit(1);
});
