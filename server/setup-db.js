#!/usr/bin/env node

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5502/postgres';

async function setupDatabase() {
  console.log('Setting up database...');

  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
    idle_timeout: 5
  });

  try {
    // Read and execute the setup SQL
    const setupSQL = fs.readFileSync(path.join(__dirname, 'setup-committees.sql'), 'utf8');

    // Split by statement-breakpoint comments and execute each statement
    const statements = setupSQL.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Committees table and sample data created.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupDatabase().catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});



