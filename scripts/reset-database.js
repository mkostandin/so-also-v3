#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('💥 Starting Database Reset...\n');

// Check if we're in the right directory
const serverDir = path.join(__dirname, '..', 'server');
const scriptPath = path.join(serverDir, 'src', 'scripts', 'reset-database.ts');

if (!fs.existsSync(scriptPath)) {
  console.error('❌ Reset script not found at:', scriptPath);
  console.error('Please ensure the script exists before running.');
  process.exit(1);
}

// Check if tsx is available in server directory
try {
  execSync('npx tsx --version', { stdio: 'pipe', cwd: serverDir });
} catch (error) {
  console.error('❌ tsx not found in server directory.');
  console.error('Please ensure tsx is installed in the server package.');
  process.exit(1);
}

console.log('💥 Running database reset...');
console.log('⚠️  This will DELETE ALL DATA from the database!');
console.log('   Make sure you have backups if needed.\n');

try {
  // Run the TypeScript file directly with tsx
  execSync(`npx tsx ${scriptPath}`, {
    stdio: 'inherit',
    cwd: serverDir
  });

} catch (error) {
  console.error('❌ Failed to run reset script:', error.message);
  process.exit(1);
}

console.log('\n✅ Database reset completed successfully!');
