import { z } from 'zod';
import {
  authResponseSchema,
  refreshResponseSchema,
  messageResponseSchema,
  meResponseSchema,
  apiErrorSchema,
  type AuthResponse,
  type RefreshResponse,
  type MessageResponse,
  type MeResponse,
} from './schemas';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from './secureStorage';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.fazn.dev';
const API_PREFIX = '/api/v1';

/**
 * Typed error thrown by the API client. `code` maps to the backend error
 * codes (INVALID_CREDENTIALS, USER_EXISTS, INVALID_OTP, TOKEN_EXPIRED,
 * INVALID_TOKEN) or a synthetic NETWORK / UNKNOWN code.
 */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Called when token refresh fails irrecoverably. The auth store registers a
 * handler here so the navigator can drop back to the Welcome screen without
 * api.ts importing the store (avoids a circular dependency).
 */
let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(handler: () => void): void {
  onAuthFailure = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach bearer token
  schema?: z.ZodTypeAny;
}

// Ensures concurrent 401s trigger only a single refresh round-trip.
let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json: unknown = await res.json();
    const parsed: RefreshResponse = refreshResponseSchema.parse(json);
    await saveTokens(parsed.accessToken, parsed.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const json: unknown = await res.json();
    const parsed = apiErrorSchema.safeParse(json);
    if (parsed.success) {
      return new ApiError(
        parsed.data.error.code,
        parsed.data.error.message,
        res.status,
      );
    }
  } catch {
    // fall through to generic
  }
  return new ApiError(
    'UNKNOWN',
    'Something went wrong. Please try again.',
    res.status,
  );
}

async function rawRequest<T>(
  path: string,
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const { method = 'GET', body, auth = false, schema } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'NETWORK',
      'No internet connection. Please check your network and try again.',
      0,
    );
  }

  // Auto-refresh on 401 for authenticated requests, then retry once.
  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return rawRequest<T>(path, options, true);
    }
    await clearTokens();
    if (onAuthFailure) onAuthFailure();
    throw new ApiError(
      'TOKEN_EXPIRED',
      'Your session has expired. Please sign in again.',
      401,
    );
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (schema) {
    return schema.parse(json) as T;
  }
  return json as T;
}

/* ----------------------------- Auth endpoints ---------------------------- */

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authApi = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return rawRequest('/auth/register', {
      method: 'POST',
      body: payload,
      schema: authResponseSchema,
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return rawRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      schema: authResponseSchema,
    });
  },

  logout(refreshToken: string): Promise<MessageResponse> {
    return rawRequest('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      schema: messageResponseSchema,
    });
  },

  me(): Promise<MeResponse> {
    return rawRequest('/auth/me', {
      method: 'GET',
      auth: true,
      schema: meResponseSchema,
    });
  },

  sendVerification(email: string): Promise<MessageResponse> {
    return rawRequest('/auth/otp/send-verification', {
      method: 'POST',
      body: { email },
      schema: messageResponseSchema,
    });
  },

  verifyEmail(email: string, otp: string): Promise<MessageResponse> {
    return rawRequest('/auth/otp/verify-email', {
      method: 'POST',
      body: { email, otp },
      schema: messageResponseSchema,
    });
  },

  forgotPassword(email: string): Promise<MessageResponse> {
    return rawRequest('/auth/otp/forgot-password', {
      method: 'POST',
      body: { email },
      schema: messageResponseSchema,
    });
  },

  resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<MessageResponse> {
    return rawRequest('/auth/otp/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword },
      schema: messageResponseSchema,
    });
  },
};

export const oauthUrl = (provider: 'google' | 'apple'): string =>
  `${API_BASE}${API_PREFIX}/auth/oauth/${provider}`;

/* ----------------------------- Profile endpoints ------------------------- */

import type { ProfileData, PrivacySettings, StreamingChannel } from '../types/profile';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
}

export interface UpdatePrivacyPayload {
  showOnlineStatus?: boolean;
  showStats?: boolean;
  showRecentResults?: boolean;
  allowChallengesFrom?: 'everyone' | 'friends' | 'nobody';
}

export const profileApi = {
  getProfile(): Promise<ProfileData> {
    return rawRequest('/profile', { auth: true });
  },

  updateProfile(payload: UpdateProfilePayload): Promise<{ user: Record<string, unknown> }> {
    return rawRequest('/profile', { method: 'PATCH', auth: true, body: payload });
  },

  getPrivacy(): Promise<PrivacySettings> {
    return rawRequest('/profile/privacy', { auth: true });
  },

  updatePrivacy(payload: UpdatePrivacyPayload): Promise<PrivacySettings> {
    return rawRequest('/profile/privacy', { method: 'PATCH', auth: true, body: payload });
  },

  getStreamingChannels(): Promise<{ data: StreamingChannel[] }> {
    return rawRequest('/profile/streaming', { auth: true });
  },

  disconnectChannel(provider: 'youtube' | 'twitch'): Promise<MessageResponse> {
    return rawRequest(`/profile/streaming/${provider}`, { method: 'DELETE', auth: true });
  },
};

/* ----------------------------- Wallet endpoints -------------------------- */

import type { WalletData, Transaction } from '../types/wallet';

export interface InitTopUpResponse {
  reference: string;
  authorizationUrl: string | null;
}

export interface WithdrawPayload {
  amount: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export const walletApi = {
  getWallet(): Promise<WalletData> {
    return rawRequest('/wallet', { auth: true });
  },

  getTransactions(
    page = 1,
    limit = 20,
  ): Promise<{ transactions: Transaction[]; total: number; page: number; limit: number }> {
    return rawRequest(`/wallet/transactions?page=${page}&limit=${limit}`, { auth: true });
  },

  initializeTopUp(amount: number, paymentMethod: string): Promise<InitTopUpResponse> {
    return rawRequest('/wallet/topup', {
      method: 'POST',
      auth: true,
      body: { amount, paymentMethod },
    });
  },

  verifyTopUp(reference: string): Promise<{ status: string; transaction: Transaction }> {
    return rawRequest('/wallet/topup/verify', {
      method: 'POST',
      auth: true,
      body: { reference },
    });
  },

  requestWithdrawal(payload: WithdrawPayload): Promise<{ transaction: Transaction }> {
    return rawRequest('/wallet/withdraw', { method: 'POST', auth: true, body: payload });
  },
};

export { rawRequest as __rawRequestForTests };
