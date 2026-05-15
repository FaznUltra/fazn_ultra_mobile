import type { User } from './schemas';

/**
 * Holds the tokens returned by /auth/register in memory only (never written
 * to SecureStore and never put in navigation params) until the user's email
 * is verified. Cleared once consumed.
 */
interface PendingAuth {
  user: User;
  accessToken: string;
  refreshToken: string;
}

let pending: PendingAuth | null = null;

export function setPendingAuth(value: PendingAuth): void {
  pending = value;
}

export function consumePendingAuth(): PendingAuth | null {
  const value = pending;
  pending = null;
  return value;
}

export function getPendingAuth(): PendingAuth | null {
  return pending;
}
