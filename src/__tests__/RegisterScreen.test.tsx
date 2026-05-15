jest.mock('../lib/api');
jest.mock('../lib/oauth', () => ({ startOAuth: jest.fn() }));
jest.mock('../store/auth.store');

import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { authApi } from '../lib/api';

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => true),
} as any;
const route = { params: undefined } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

function renderScreen() {
  return render(<RegisterScreen navigation={navigation} route={route} />);
}

function fillValidForm() {
  fireEvent.changeText(screen.getByTestId('register-firstName'), 'Jane');
  fireEvent.changeText(screen.getByTestId('register-lastName'), 'Doe');
  fireEvent.changeText(screen.getByTestId('register-email'), 'jane@doe.com');
  fireEvent.changeText(screen.getByTestId('register-username'), 'janedoe');
  fireEvent.changeText(screen.getByTestId('register-password'), 'password123');
  fireEvent.changeText(
    screen.getByTestId('register-confirmPassword'),
    'password123',
  );
}

// Walk the 3-step wizard to the final step by filling each step and
// pressing Continue.
function advanceToFinalStep() {
  fireEvent.changeText(screen.getByTestId('register-firstName'), 'Jane');
  fireEvent.changeText(screen.getByTestId('register-lastName'), 'Doe');
  fireEvent.press(screen.getByTestId('register-submit'));
  fireEvent.changeText(screen.getByTestId('register-email'), 'jane@doe.com');
  fireEvent.changeText(screen.getByTestId('register-username'), 'janedoe');
  fireEvent.press(screen.getByTestId('register-submit'));
}

describe('RegisterScreen', () => {
  it('renders all form fields', () => {
    renderScreen();
    expect(screen.getByTestId('register-firstName')).toBeTruthy();
    expect(screen.getByTestId('register-lastName')).toBeTruthy();
    expect(screen.getByTestId('register-email')).toBeTruthy();
    expect(screen.getByTestId('register-username')).toBeTruthy();
    expect(screen.getByTestId('register-password')).toBeTruthy();
    expect(screen.getByTestId('register-confirmPassword')).toBeTruthy();
  });

  it('renders a back button and social sign-in buttons', () => {
    renderScreen();
    expect(screen.getByTestId('register-back')).toBeTruthy();
    expect(screen.getByTestId('register-google')).toBeTruthy();
    expect(screen.getByTestId('register-apple')).toBeTruthy();
    expect(screen.getByTestId('register-progress')).toBeTruthy();
  });

  it('shows required errors on the first step when empty', async () => {
    renderScreen();
    fireEvent.press(screen.getByTestId('register-submit'));
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeTruthy();
      expect(screen.getByText('Last name is required')).toBeTruthy();
    });
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('flags a password mismatch on the final step', async () => {
    renderScreen();
    advanceToFinalStep();
    fireEvent.changeText(screen.getByTestId('register-password'), 'password123');
    fireEvent.changeText(
      screen.getByTestId('register-confirmPassword'),
      'different',
    );
    fireEvent.press(screen.getByTestId('register-submit'));
    await waitFor(() =>
      expect(screen.getByText('Passwords do not match')).toBeTruthy(),
    );
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('rejects an invalid username on the account step', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByTestId('register-firstName'), 'Jane');
    fireEvent.changeText(screen.getByTestId('register-lastName'), 'Doe');
    fireEvent.press(screen.getByTestId('register-submit'));
    fireEvent.changeText(screen.getByTestId('register-email'), 'jane@doe.com');
    fireEvent.changeText(screen.getByTestId('register-username'), 'no');
    fireEvent.press(screen.getByTestId('register-submit'));
    await waitFor(() =>
      expect(
        screen.getByText(
          'Username must be 3-32 letters, numbers or underscores',
        ),
      ).toBeTruthy(),
    );
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('registers and navigates to VerifyEmail on success', async () => {
    (authApi.register as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'jane@doe.com' },
      accessToken: 'acc',
      refreshToken: 'ref',
    });
    (authApi.sendVerification as jest.Mock).mockResolvedValue({
      message: 'sent',
    });
    renderScreen();
    fillValidForm();
    fireEvent.press(screen.getByTestId('register-submit'));

    await waitFor(() =>
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'jane@doe.com',
        username: 'janedoe',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    );
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('VerifyEmail', {
        email: 'jane@doe.com',
      }),
    );
  });
});
