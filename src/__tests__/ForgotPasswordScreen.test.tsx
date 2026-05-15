jest.mock('../lib/api');
jest.mock('../store/auth.store');

import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { authApi } from '../lib/api';

const navigation = { navigate: jest.fn() } as any;
const route = { params: undefined } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

function renderScreen() {
  return render(
    <ForgotPasswordScreen navigation={navigation} route={route} />,
  );
}

describe('ForgotPasswordScreen', () => {
  it('renders the email field and submit button', () => {
    renderScreen();
    expect(screen.getByTestId('forgot-email')).toBeTruthy();
    expect(screen.getByTestId('forgot-submit')).toBeTruthy();
  });

  it('validates the email before calling the api', async () => {
    renderScreen();
    fireEvent.press(screen.getByTestId('forgot-submit'));
    await waitFor(() =>
      expect(screen.getByText('Email is required')).toBeTruthy(),
    );
    expect(authApi.forgotPassword).not.toHaveBeenCalled();
  });

  it('calls the api and navigates to ResetPassword on success', async () => {
    (authApi.forgotPassword as jest.Mock).mockResolvedValue({
      message: 'sent',
    });
    renderScreen();
    fireEvent.changeText(screen.getByTestId('forgot-email'), 'a@b.com');
    fireEvent.press(screen.getByTestId('forgot-submit'));

    await waitFor(() =>
      expect(authApi.forgotPassword).toHaveBeenCalledWith('a@b.com'),
    );
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
        email: 'a@b.com',
      }),
    );
  });
});
