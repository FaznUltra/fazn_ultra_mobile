jest.mock('../lib/api');
jest.mock('../store/auth.store');

import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { authApi, ApiError } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

const mockLogin = (useAuthStore as any).getState().login as jest.Mock;

const navigation = { navigate: jest.fn() } as any;
const route = { params: undefined } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

function renderScreen() {
  return render(<LoginScreen navigation={navigation} route={route} />);
}

describe('LoginScreen', () => {
  it('renders email and password fields', () => {
    renderScreen();
    expect(screen.getByTestId('login-email')).toBeTruthy();
    expect(screen.getByTestId('login-password')).toBeTruthy();
    expect(screen.getByTestId('login-submit')).toBeTruthy();
  });

  it('shows validation errors on empty submit and does not call the api', async () => {
    renderScreen();
    fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
    });
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByTestId('login-email'), 'not-an-email');
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() =>
      expect(screen.getByText('Enter a valid email address')).toBeTruthy(),
    );
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('calls the api with valid input and logs in on success', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (authApi.login as jest.Mock).mockResolvedValue({
      user,
      accessToken: 'acc',
      refreshToken: 'ref',
    });
    renderScreen();
    fireEvent.changeText(screen.getByTestId('login-email'), 'a@b.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith('a@b.com', 'password123'),
    );
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith(user, 'acc', 'ref'),
    );
  });

  it('shows a friendly error on invalid credentials', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 'bad', 401),
    );
    renderScreen();
    fireEvent.changeText(screen.getByTestId('login-email'), 'a@b.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(screen.getByText('Incorrect email or password.')).toBeTruthy(),
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('navigates to Register and ForgotPassword from links', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Forgot password?'));
    expect(navigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    fireEvent.press(screen.getByText('Create one'));
    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
