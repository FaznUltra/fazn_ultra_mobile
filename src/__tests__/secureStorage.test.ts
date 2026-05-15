jest.mock('expo-secure-store');

import * as SecureStore from 'expo-secure-store';
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../lib/secureStorage';

beforeEach(() => {
  (SecureStore as unknown as { __reset: () => void }).__reset();
});

describe('secureStorage', () => {
  it('saveTokens stores both tokens under the documented keys', async () => {
    await saveTokens('access-123', 'refresh-456');
    expect(await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)).toBe('access-123');
    expect(await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)).toBe(
      'refresh-456',
    );
  });

  it('getAccessToken / getRefreshToken read back stored values', async () => {
    await saveTokens('a', 'b');
    expect(await getAccessToken()).toBe('a');
    expect(await getRefreshToken()).toBe('b');
  });

  it('getAccessToken returns null when nothing stored', async () => {
    expect(await getAccessToken()).toBeNull();
  });

  it('clearTokens removes both tokens', async () => {
    await saveTokens('a', 'b');
    await clearTokens();
    expect(await getAccessToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
  });
});
