import { create } from 'zustand';
import type { User } from '../lib/schemas';
import { authApi, setAuthFailureHandler } from '../lib/api';
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../lib/secureStorage';

interface AuthState {
  user: User | null;
  /** True while the initial launch-time session check is running. */
  isLoading: boolean;
  isAuthenticated: boolean;

  /** Persist tokens + user after a successful login/verify. */
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  /** Clear server session + local tokens and reset to unauthenticated. */
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  /** Run on app launch: restore session from SecureStore if possible. */
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (user, accessToken, refreshToken) => {
    await saveTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Best-effort server logout — clear locally regardless.
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  bootstrap: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();
      if (!accessToken && !refreshToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      // /auth/me will auto-refresh via api.ts if the access token expired.
      const { user } = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Wire api.ts's auth-failure callback to the store so an irrecoverable
// refresh failure drops the user back to the Welcome screen.
setAuthFailureHandler(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});
