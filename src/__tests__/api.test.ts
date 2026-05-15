jest.mock('expo-secure-store');

import * as SecureStore from 'expo-secure-store';
import { authApi, ApiError } from '../lib/api';
import { saveTokens, getAccessToken } from '../lib/secureStorage';

const realFetch = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  (SecureStore as unknown as { __reset: () => void }).__reset();
  jest.restoreAllMocks();
});

afterAll(() => {
  global.fetch = realFetch;
});

describe('api client', () => {
  it('success path: parses and returns a valid login response', async () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      username: 'ab',
      first_name: 'A',
      last_name: 'B',
      role: 'player',
      email_verified: true,
      auth_provider: 'local',
    };
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        jsonResponse({ user, accessToken: 'acc', refreshToken: 'ref' }),
      );

    const res = await authApi.login('a@b.com', 'password123');
    expect(res.user.email).toBe('a@b.com');
    expect(res.accessToken).toBe('acc');
  });

  it('maps a backend error envelope to ApiError with its code', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Nope' } },
        401,
      ),
    );

    await expect(authApi.login('a@b.com', 'wrong')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('401 on an authed request triggers refresh then retries the original', async () => {
    await saveTokens('expired-access', 'good-refresh');

    const fetchMock = jest
      .fn()
      // 1. /auth/me -> 401
      .mockResolvedValueOnce(jsonResponse({}, 401))
      // 2. /auth/refresh -> new tokens
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: 'new-acc', refreshToken: 'new-ref' }),
      )
      // 3. retried /auth/me -> success
      .mockResolvedValueOnce(
        jsonResponse({
          user: {
            id: '1',
            email: 'a@b.com',
            username: 'ab',
            first_name: 'A',
            last_name: 'B',
            role: 'player',
            email_verified: true,
            auth_provider: 'local',
          },
        }),
      );
    global.fetch = fetchMock;

    const res = await authApi.me();
    expect(res.user.email).toBe('a@b.com');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(await getAccessToken()).toBe('new-acc');
  });

  it('401 with a failed refresh clears tokens and throws TOKEN_EXPIRED', async () => {
    await saveTokens('expired-access', 'bad-refresh');

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 401)) // /auth/me
      .mockResolvedValueOnce(jsonResponse({}, 401)); // /auth/refresh fails

    await expect(authApi.me()).rejects.toBeInstanceOf(ApiError);
    expect(await getAccessToken()).toBeNull();
  });
});
