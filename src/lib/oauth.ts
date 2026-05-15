import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { oauthUrl } from './api';
import { authApi } from './api';
import type { User } from './schemas';

WebBrowser.maybeCompleteAuthSession();

// TODO: The deep link scheme `fazn://` must be configured in app.json
//   ("expo": { "scheme": "fazn" }) and the iOS/Android native projects
//   regenerated (npx expo prebuild) once the OAuth client keys are ready.
//   The backend redirects to fazn://auth/callback?accessToken=...&refreshToken=...
const REDIRECT_URL = Linking.createURL('auth/callback');

export interface OAuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Opens the backend OAuth endpoint in an in-app browser and waits for the
 * deep-link callback carrying the tokens. Fetches the user via /auth/me
 * once tokens are obtained.
 */
export async function startOAuth(
  provider: 'google' | 'apple',
): Promise<OAuthResult | null> {
  const authUrl = `${oauthUrl(provider)}?redirect_uri=${encodeURIComponent(
    REDIRECT_URL,
  )}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URL);

  if (result.type !== 'success' || !result.url) {
    return null; // user cancelled / dismissed
  }

  const { queryParams } = Linking.parse(result.url);
  const accessToken =
    typeof queryParams?.accessToken === 'string'
      ? queryParams.accessToken
      : null;
  const refreshToken =
    typeof queryParams?.refreshToken === 'string'
      ? queryParams.refreshToken
      : null;

  if (!accessToken || !refreshToken) {
    throw new Error('OAuth did not return valid tokens');
  }

  // Tokens must be persisted before /auth/me so the bearer header is set.
  const { saveTokens } = await import('./secureStorage');
  await saveTokens(accessToken, refreshToken);
  const { user } = await authApi.me();

  return { user, accessToken, refreshToken };
}
