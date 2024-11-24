// src/services/userService.ts
import { query, execute } from '../database';
import { User, UserRestriction } from '../types';

/**
 * Ensures a user exists in the database, adding them if they don't exist.
 */
export const ensureUserExists = (userId: number, username: string): void => {
  const userExists = query<User>('SELECT id FROM users WHERE id = ?', [userId])[0];

  if (!userExists) {
    execute(
      'INSERT INTO users (id, username, role, whitelist, blacklist) VALUES (?, ?, ?, ?, ?)',
      [userId, username, 'pleb', 0, 0]
    );
    console.log(`Added new user: ${username} (${userId})`);
  } else {
    execute(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, userId]
    );
  }
};

/**
 * Adds a restriction for a specific user.
 */
export const addUserRestriction = (
  userId: number,
  restriction: string,
  restrictedAction?: string,
  metadata?: Record<string, any>,
  restrictedUntil?: number
): void => {
  execute(
    'INSERT INTO user_restrictions (user_id, restriction, restricted_action, metadata, restricted_until) VALUES (?, ?, ?, ?, ?)',
    [
      userId,
      restriction,
      restrictedAction || null, // Handle undefined by converting to null for database
      metadata ? JSON.stringify(metadata) : null, // Store metadata as JSON or null
      restrictedUntil || null // Convert undefined expiration to null
    ]
  );
};

/**
 * Removes a restriction for a specific user.
 */
export const removeUserRestriction = (userId: number, restriction: string): void => {
  execute(
    'DELETE FROM user_restrictions WHERE user_id = ? AND restriction = ?',
    [userId, restriction]
  );
};

/**
 * Retrieves all restrictions for a specific user.
 */
export const getUserRestrictions = (userId: number): UserRestriction[] => {
  return query<UserRestriction>(
    'SELECT * FROM user_restrictions WHERE user_id = ?',
    [userId]
  );
};
