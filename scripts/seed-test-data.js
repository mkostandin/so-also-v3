#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting YPAA Test Data Seeder...\n');

// Check if we're in the right directory
const serverDir = path.join(__dirname, '..', 'server');
const scriptPath = path.join(serverDir, 'src', 'scripts', 'seed-test-data.ts');

if (!fs.existsSync(scriptPath)) {
  console.error('❌ Seed script not found at:', scriptPath);
  console.error('Please ensure the script exists before running.');
  process.exit(1);
}

// Check if TypeScript compiler is available in server directory
try {
  execSync('npx tsc --version', { stdio: 'pipe', cwd: serverDir });
} catch (error) {
  console.error('❌ TypeScript compiler not found in server directory.');
  console.error('Please ensure TypeScript is installed in the server package.');
  process.exit(1);
}

console.log('🔧 Compiling TypeScript seed script...');

try {
  // Compile the TypeScript file
  execSync(`npx tsc ${scriptPath} --outDir ${serverDir}/dist --module commonjs --target es2020 --esModuleInterop`, {
    stdio: 'inherit',
    cwd: serverDir
  });

  console.log('✅ Compilation successful!\n');

  // Run the compiled JavaScript
  console.log('🌱 Running test data seeder...');
  execSync(`node dist/src/scripts/seed-test-data.js`, {
    stdio: 'inherit',
    cwd: serverDir
  });

} catch (error) {
  console.error('❌ Failed to run seed script:', error.message);
  process.exit(1);
}

console.log('\n🎉 Test data seeding completed successfully!');
console.log('\nNext steps:');
console.log('1. Start your development server: pnpm run dev');
console.log('2. Visit /map to see your events on the map!');
console.log('3. Check /api/v1/browse to see the API response');
