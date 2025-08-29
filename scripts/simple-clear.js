#!/usr/bin/env node

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Simple Data Clear Script');
console.log('==========================\n');

// Read environment file
let databaseUrl = '';
try {
  const envPath = path.join(__dirname, '..', 'server', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) {
    databaseUrl = match[1].trim();
  }
} catch (error) {
  console.log('❌ Could not read .env file');
}

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found');
  console.log('\n🔧 Manual clear commands:');
  console.log('Run these SQL commands in your database:');
  console.log('');
  console.log('-- Clear test events');
  console.log(`DELETE FROM app.events WHERE status = 'approved' AND name IN (`);
  console.log(`  'NECYPAA Committee Meeting',`);
  console.log(`  'NECYPAA 35',`);
  console.log(`  'MSCYPAA 26',`);
  console.log(`  'NECYPAA Fall Festival',`);
  console.log(`  'RYAA Spring Dance',`);
  console.log(`  'CSCYPAA Committee Meeting',`);
  console.log(`  'Maine YPAA Workshop',`);
  console.log(`  'Vermont YPAA Dance',`);
  console.log(`  'Rhode Island YPAA Meeting'`);
  console.log(`);`);
  console.log('');
  console.log('-- Check what\'s left');
  console.log('SELECT COUNT(*) FROM app.events;');
  process.exit(1);
}

console.log('📡 Database URL found');
console.log('🔗 Connection details:');
console.log(`   URL: ${databaseUrl.replace(/:([^:@]{4})[^:@]*@/, ':$1****@')}`);
console.log('');

console.log('📋 SQL Commands to run manually:');
console.log('');
console.log('-- Clear test events');
console.log('DELETE FROM app.events');
console.log(`WHERE status = 'approved'`);
console.log(`AND name IN (`);
console.log(`  'NECYPAA Committee Meeting',`);
console.log(`  'NECYPAA 35',`);
console.log(`  'MSCYPAA 26',`);
console.log(`  'NECYPAA Fall Festival',`);
console.log(`  'RYAA Spring Dance',`);
console.log(`  'CSCYPAA Committee Meeting',`);
console.log(`  'Maine YPAA Workshop',`);
console.log(`  'Vermont YPAA Dance',`);
console.log(`  'Rhode Island YPAA Meeting'`);
console.log(');');
console.log('');
console.log('-- Check what\'s left');
console.log('SELECT COUNT(*) FROM app.events;');
console.log('SELECT COUNT(*) FROM app.conferences;');
console.log('SELECT COUNT(*) FROM app.occurrences;');
console.log('');

console.log('💡 You can run these commands in:');
console.log('• PostgreSQL client (psql)');
console.log('• Database admin tool (pgAdmin, DBeaver)');
console.log('• Your database provider\'s web interface');
console.log('');
console.log('✅ Script completed - use the SQL commands above to clear your data!');
