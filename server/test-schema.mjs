import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(connectionString, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 5,
});

async function testSchema() {
  try {
    console.log('🔍 Testing database schema...');

    // Check if image_urls column exists
    const imageUrlsResult = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'app'
      AND table_name = 'events'
      AND column_name = 'image_urls'
    `;

    if (imageUrlsResult.length > 0) {
      console.log('✅ image_urls column found:', imageUrlsResult[0]);
    } else {
      console.log('❌ image_urls column not found');
    }

    // List all tables in app schema
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'app'
    `;

    console.log('✅ Tables in app schema:', tables.map(t => t.table_name));

    // Test a simple query on events table
    const eventCount = await sql`
      SELECT COUNT(*) as count FROM app.events
    `;

    console.log('✅ Events table query successful, count:', eventCount[0].count);

  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testSchema();
