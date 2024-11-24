// Type for a User in the database
export interface User {
  id: number; // Telegram user ID
  username: string;
  whitelist: boolean;
  blacklist: boolean;
  role: 'owner' | 'admin' | 'elevated' | 'pleb'; // User roles
}

export interface GlobalAction {
  id: number;
  restriction: string;
  restricted_action?: string;
}

// Type for a Rule
export interface Rule {
  id: number; // Rule ID
  type: 'whitelist' | 'blacklist'; // Rule type
  description: string; // Description of the rule
  specificAction?: string; // Optional specific action (e.g., a domain name)
}

// Type for a Violation
export interface Violation {
  id: number; // Violation ID
  userId: number; // Associated user's ID
  ruleId: number; // Rule ID that was violated
  timestamp: number; // Time of violation (epoch time)
  bailAmount: number; // Bail amount in JUNO
  paid: boolean; // true if the violation's bail is paid
}

// Type for a User Restriction
export interface UserRestriction {
  id: number;
  userId: number; // User ID from the database
  restriction: string; // Restriction type (e.g., "no_stickers", "no_urls", "regex_block")
  restrictedAction?: string; // Optional target (e.g., domain, sticker pack ID)
  metadata?: string; // Optional JSON-encoded metadata
  restrictedUntil?: number; // Expiration timestamp (epoch time) or NULL
}
