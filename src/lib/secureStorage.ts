import * as SecureStore from 'expo-secure-store';

/**
 * Secure token storage backed by expo-secure-store (Keychain on iOS,
 * EncryptedSharedPreferences/Keystore on Android). Tokens are never
 * written to AsyncStorage or logged.
 */

export const ACCESS_TOKEN_KEY = 'fazn_access';
export const REFRESH_TOKEN_KEY = 'fazn_refresh';

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Decode a JWT payload without verifying the signature (verification is the
 * server's job) purely to read the `exp` claim for a cheap client-side
 * "is this worth sending" check.
 */
function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    );
    const json = globalThis.atob
      ? globalThis.atob(padded)
      : Buffer.from(padded, 'base64').toString('binary');
    const parsed = JSON.parse(json) as { exp?: number };
    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

/**
 * Returns true when the access token is missing or expired (with a 30s
 * skew buffer so we refresh slightly early rather than mid-request).
 */
export function isAccessTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const exp = decodeJwtExp(token);
  if (exp === null) return false; // can't tell — let the server decide
  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds + 30;
}
