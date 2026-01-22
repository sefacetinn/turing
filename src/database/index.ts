/**
 * Database Module
 *
 * WatermelonDB initialization and database access.
 * Provides offline-first data storage with Firestore sync.
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Platform } from 'react-native';

import schema, { TableNames, SCHEMA_VERSION } from './schema';
import modelClasses from './models';

// Database instance (singleton)
let database: Database | null = null;

/**
 * Initialize the WatermelonDB database
 */
export function initDatabase(): Database {
  if (database) {
    return database;
  }

  // Create SQLite adapter
  const adapter = new SQLiteAdapter({
    schema,
    // Enable JSI for better performance on supported platforms
    jsi: Platform.OS === 'ios',
    // Database file name
    dbName: 'turing_offline',
    // Called when database needs migration
    onSetUpError: (error) => {
      console.error('[Database] Setup error:', error);
    },
  });

  // Create database instance
  database = new Database({
    adapter,
    modelClasses,
  });

  console.log(`[Database] Initialized with schema version ${SCHEMA_VERSION}`);

  return database;
}

/**
 * Get the database instance
 * Throws if database is not initialized
 */
export function getDatabase(): Database {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
}

/**
 * Get a collection from the database
 */
export function getCollection(tableName: string) {
  const db = getDatabase();
  return db.get(tableName);
}

/**
 * Reset the database (clear all data)
 * Use with caution - this deletes all local data
 */
export async function resetDatabase(): Promise<void> {
  const db = getDatabase();

  await db.write(async () => {
    await db.unsafeResetDatabase();
  });

  console.log('[Database] Reset complete');
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (database) {
    // WatermelonDB doesn't have an explicit close method
    // Just set the reference to null
    database = null;
    console.log('[Database] Closed');
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return database !== null;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  tables: { name: string; count: number }[];
  totalRecords: number;
}> {
  const db = getDatabase();
  const tables: { name: string; count: number }[] = [];
  let totalRecords = 0;

  for (const tableName of Object.values(TableNames)) {
    try {
      const collection = db.get(tableName);
      const count = await collection.query().fetchCount();
      tables.push({ name: tableName, count });
      totalRecords += count;
    } catch (error) {
      console.error(`[Database] Error getting count for ${tableName}:`, error);
      tables.push({ name: tableName, count: 0 });
    }
  }

  return { tables, totalRecords };
}

// Re-export schema and models
export { schema, TableNames, SCHEMA_VERSION } from './schema';
export * from './models';

export default {
  initDatabase,
  getDatabase,
  getCollection,
  resetDatabase,
  closeDatabase,
  isDatabaseInitialized,
  getDatabaseStats,
};
