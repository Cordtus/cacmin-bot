// src/database.ts
import Database from 'better-sqlite3';
import { User, Rule, Violation } from './types';

const db = new Database('./data/bot.db', { verbose: console.log });

// Typed queries return typed results, which avoids additional manual casting, for example:
// const violations = query<Violation>('SELECT * FROM violations WHERE user_id = ?', [userId]);
// returns an array of objects that adhere to the 'Violation' interface:
// [
//   {
//     "id": 1,
//     "userId": 12345,
//     "ruleId": 2,
//     "timestamp": 1679515800,
//     "bailAmount": 50.5,
//     "paid": false
//   }
// ]

// Helper function for typed queries
export const query = <T>(sql: string, params: unknown[] = []): T[] => {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params) as T[];
  } catch (error) {
    console.error(`Database query failed: ${sql}`, error);
    throw error; // Propagate the error for higher-level handling
  }
};

// Insert/Update helpers
export const execute = (sql: string, params: unknown[] = []): void => {
  try {
    const stmt = db.prepare(sql);
    stmt.run(params);
  } catch (error) {
    console.error(`Database execution failed: ${sql}`, error);
    throw error;
  }
};

export const initDb = () => {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      role TEXT DEFAULT 'pleb',
      whitelist INTEGER DEFAULT 0,
      blacklist INTEGER DEFAULT 0
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      description TEXT,
      specific_action TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      rule_id INTEGER,
      timestamp INTEGER,
      bail_amount REAL,
      paid INTEGER DEFAULT 0
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_restrictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,              -- Reference to the users table
      restriction TEXT,             -- General type of restriction (e.g., "no_stickers", "no_urls", "regex_block")
      restricted_action TEXT,       -- Specific target (e.g., "sticker_pack_id", "example.com", regex pattern)
      metadata TEXT,                -- Additional metadata (JSON format for extensibility)
      restricted_until INTEGER,     -- Epoch timestamp for when the restriction expires (NULL for permanent)
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS global_restrictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restriction TEXT,             -- General type of restriction
      restricted_action TEXT,       -- Specific target
      metadata TEXT,                -- Additional metadata (JSON format for extensibility)
      restricted_until INTEGER      -- Expiry timestamp (NULL for permanent)
    );
  `);

  console.log('Database initialized successfully.');
  return db;
};