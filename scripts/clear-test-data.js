#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Starting YPAA Test Data Cleanup...\n');

// Check if we're in the right directory
const serverDir = path.join(__dirname, '..', 'server');
const scriptPath = path.join(serverDir, 'src', 'scripts', 'clear-test-data.ts');

if (!fs.existsSync(scriptPath)) {
  console.error('❌ Clear script not found at:', scriptPath);
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

console.log('🧹 Running test data cleanup...');

try {
  // Run the TypeScript file directly with tsx
  execSync(`npx tsx ${scriptPath}`, {
    stdio: 'inherit',
    cwd: serverDir
  });

} catch (error) {
  console.error('❌ Failed to run clear script:', error.message);
  process.exit(1);
}

console.log('\n✅ Test data cleanup completed successfully!');
