// src/utils/roles.ts
import { User } from '../types';
import { query } from '../database';

/**
 * Check if a user is the group owner.
 */
export const isGroupOwner = (userId: number, ownerId: number): boolean => userId === ownerId;

/**
 * Check if a user has a specific role.
 */
export const hasRole = (userId: number, role: 'owner' | 'admin' | 'elevated' | 'default'): boolean => {
  const user = query<User>('SELECT * FROM users WHERE id = ?', [userId])[0];
  return user?.role === role;
};
