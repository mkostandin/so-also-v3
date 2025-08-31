#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏛️ Starting NECYPAA 35 Conference Data Seeder...\n');

// Check if we're in the right directory
const serverDir = path.join(__dirname, '..', 'server');
const scriptPath = path.join(serverDir, 'src', 'scripts', 'seed-conference-data.ts');

if (!fs.existsSync(scriptPath)) {
  console.error('❌ Conference seed script not found at:', scriptPath);
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

console.log('🌱 Running conference test data seeder with tsx...');

try {
  // Run the TypeScript file directly with tsx
  execSync(`npx tsx ${scriptPath}`, {
    stdio: 'inherit',
    cwd: serverDir
  });

} catch (error) {
  console.error('❌ Failed to run conference seed script:', error.message);
  process.exit(1);
}

console.log('\n🎉 NECYPAA 35 Conference data seeding completed successfully!');
console.log('\nNext steps:');
console.log('1. Start your development server: pnpm run dev');
console.log('2. Visit /map to see NECYPAA 35 on the map!');
console.log('3. Check /api/v1/conferences to see the conference API response');
console.log('4. Check /api/v1/conference-sessions to see the session API response');
console.log('\n📊 What was seeded:');
console.log('• NECYPAA 35th Annual Conference - Manchester, NH (Jan 9-11, 2026)');
console.log('• 15+ sessions: workshops, panels, main sessions, events, dances');
console.log('• YPAA-specific content: sponsorship, Big Book study, service work, traditions');
console.log('• Complete 3-day schedule with proper time slots and room assignments');
console.log('• Conference-specific URLs, images, and metadata at 700 Elm Street, Manchester, NH');
console.log('\n🧹 To clean up test data, you can manually delete records with status=\'approved\' from conferences and conference_sessions tables.');
