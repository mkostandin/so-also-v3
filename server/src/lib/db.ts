import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as createDrizzlePostgres } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from '../schema';

type DatabaseConnection = ReturnType<typeof drizzle> | ReturnType<typeof createDrizzlePostgres>;

let cachedConnection: DatabaseConnection | null = null;
let cachedConnectionString: string | null = null;

const isNeonDatabase = (connectionString: string): boolean => {
  return connectionString.includes('neon.tech') || connectionString.includes('neon.database');
};

const createConnection = async (connectionString: string, retryCount = 0): Promise<DatabaseConnection> => {
  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

  try {
    if (isNeonDatabase(connectionString)) {
      const sql = neon(connectionString);
      return drizzle(sql, { schema });
    }

    const client = postgres(connectionString, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
      // Add connection validation
      onnotice: () => {}, // Suppress notices in production
    });

    return createDrizzlePostgres(client, { schema });
  } catch (error) {
    if (retryCount < maxRetries) {
      console.warn(`Database connection attempt ${retryCount + 1} failed, retrying in ${retryDelay}ms:`, error instanceof Error ? error.message : error);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return createConnection(connectionString, retryCount + 1);
    }
    throw new Error(`Failed to connect to database after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getDatabase = async (connectionString?: string): Promise<DatabaseConnection> => {
  // Use default local database connection if no external connection string provided
  // Note: In development, the port is dynamically allocated by port-manager.js
  const defaultLocalConnection = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5502/postgres';
  const connStr = connectionString || defaultLocalConnection;

  if (cachedConnection && cachedConnectionString === connStr) {
    return cachedConnection;
  }

  if (!connStr) {
    throw new Error('No database connection available. Ensure database server is running or provide a connection string.');
  }

  cachedConnection = await createConnection(connStr);
  cachedConnectionString = connStr;

  return cachedConnection;
};

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    if (!cachedConnection) {
      console.warn('No cached database connection available for health check');
      return false;
    }

    // Use a simple query to test connectivity
    await cachedConnection.execute(sql`SELECT 1 as health_check`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error instanceof Error ? error.message : error);
    // Clear cached connection on failure so it can be recreated
    clearConnectionCache();
    return false;
  }
};

export const clearConnectionCache = (): void => {
  cachedConnection = null;
  cachedConnectionString = null;
};

/**
 * Get connection information for debugging and monitoring
 */
export const getConnectionInfo = () => {
  return {
    hasConnection: cachedConnection !== null,
    connectionString: cachedConnectionString ? `${cachedConnectionString.substring(0, 20)}...` : null,
    isNeon: cachedConnectionString ? isNeonDatabase(cachedConnectionString) : false,
  };
};