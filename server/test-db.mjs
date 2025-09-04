import postgres from 'postgres';

const sql = postgres('postgresql://postgres:password@localhost:5502/postgres');

try {
  const result = await sql`SELECT version()`;
  console.log('✅ Database is running!');
  console.log('PostgreSQL version:', result[0].version);
} catch (err) {
  console.error('❌ Database not running:', err.message);
} finally {
  await sql.end();
}
