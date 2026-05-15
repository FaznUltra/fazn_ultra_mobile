// Manual mock for src/lib/api.ts used by screen tests.

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const authApi = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  sendVerification: jest.fn(),
  verifyEmail: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

export const oauthUrl = jest.fn(
  (p: string) => `https://api.fazn.dev/api/v1/auth/oauth/${p}`,
);

export const setAuthFailureHandler = jest.fn();
