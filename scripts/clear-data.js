#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function clearData() {
  console.log('🧹 Starting manual data cleanup...\n');

  // Get database URL
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.error('Please check your server/.env file');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');

  const sql = postgres(databaseUrl, {
    max: 1,
    onnotice: () => {} // Suppress notices
  });

  try {
    // Test connection
    await sql`SELECT 1`;

    console.log('✅ Database connected successfully\n');

    // Clear test events
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

    console.log('🗑️  Deleting test events...');

    let totalDeleted = 0;

    for (const eventName of testEventNames) {
      try {
        const result = await sql`
          DELETE FROM app.events
          WHERE status = 'approved'
          AND name = ${eventName}
        `;

        if (result.count > 0) {
          totalDeleted += result.count;
          console.log(`✅ Deleted: ${eventName}`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete ${eventName}:`, error.message);
      }
    }

    // Get counts
    const eventCount = await sql`SELECT COUNT(*) as count FROM app.events`;
    const conferenceCount = await sql`SELECT COUNT(*) as count FROM app.conferences`;
    const occurrenceCount = await sql`SELECT COUNT(*) as count FROM app.occurrences`;

    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📊 Test events deleted: ${totalDeleted}`);
    console.log(`📊 Events remaining: ${eventCount[0].count}`);
    console.log(`📊 Conferences remaining: ${conferenceCount[0].count}`);
    console.log(`📊 Occurrences remaining: ${occurrenceCount[0].count}`);

    if (totalDeleted === 0) {
      console.log('\nℹ️  No test events found to delete.');
      console.log('   This might mean:');
      console.log('   • Test data was never seeded');
      console.log('   • Events were already deleted');
      console.log('   • Database connection issues');
    }

  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }

  console.log('\n✅ Manual cleanup completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('• Run: pnpm run seed:test-data');
  console.log('• Or restart with fresh data');
}

clearData().catch((error) => {
  console.error('💥 Clear data script failed:', error);
  process.exit(1);
});
