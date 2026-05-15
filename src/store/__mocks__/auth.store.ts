// Manual mock for src/store/auth.store.ts used by screen tests.

export const mockLogin = jest.fn();
export const mockLogout = jest.fn();
export const mockSetUser = jest.fn();
export const mockBootstrap = jest.fn();

const state = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: mockLogin,
  logout: mockLogout,
  setUser: mockSetUser,
  bootstrap: mockBootstrap,
};

type Selector<T> = (s: typeof state) => T;

export const useAuthStore = Object.assign(
  <T>(selector: Selector<T>): T => selector(state),
  {
    getState: () => state,
    setState: (partial: Partial<typeof state>) =>
      Object.assign(state, partial),
  },
);
