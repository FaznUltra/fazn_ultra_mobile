import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WithdrawScreen } from '../../../screens/app/wallet/WithdrawScreen';
import type { WalletData } from '../../../types/wallet';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => {
    const { View } = require('react-native');
    const mockReact = require('react');
    return mockReact.createElement(View, { testID }, children);
  },
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-svg', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const m = (n: string) => (p: object) =>
    mockReact.createElement(View, { testID: `svg-${n}`, ...p });
  return {
    __esModule: true,
    default: m('svg'),
    Svg: m('svg'),
    Path: m('path'),
    Circle: m('circle'),
    Polyline: m('polyline'),
  };
});

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const mockWithdraw = jest.fn();

const DATA: WalletData = {
  balance: 12500,
  pendingAmount: 0,
  totalWon: 0,
  totalSpent: 0,
  transactions: [],
};

jest.mock('../../../hooks/useWallet', () => ({
  useWallet: () => ({
    state: { status: 'success', data: DATA },
    topUp: jest.fn(),
    withdraw: mockWithdraw,
    sendGift: jest.fn(),
    refreshWallet: jest.fn(),
  }),
}));

const renderScreen = () =>
  render(
    <WithdrawScreen navigation={mockNavigation as never} route={{} as never} />,
  );

const fillBank = (u: ReturnType<typeof renderScreen>) => {
  fireEvent.changeText(u.getByTestId('bank-account-name'), 'John Doe');
  fireEvent.changeText(u.getByTestId('bank-account-number'), '0123456789');
  fireEvent.changeText(u.getByTestId('bank-name'), 'GTBank');
};

describe('WithdrawScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders with available balance', () => {
    const { getByTestId, getByText } = renderScreen();
    expect(getByTestId('withdraw-screen')).toBeTruthy();
    expect(getByText('Available: ₦12,500')).toBeTruthy();
  });

  it('quick pick 50% fills correct amount', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('withdraw-quick-50'));
    expect(getByTestId('withdraw-amount-input').props.value).toBe('6250');
  });

  it('continue disabled below min 1000 Tokens', () => {
    const { getByTestId } = renderScreen();
    fireEvent.changeText(getByTestId('withdraw-amount-input'), '500');
    expect(
      getByTestId('withdraw-continue-btn').props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('continue advances to bank details step', () => {
    const { getByTestId } = renderScreen();
    fireEvent.changeText(getByTestId('withdraw-amount-input'), '2000');
    fireEvent.press(getByTestId('withdraw-continue-btn'));
    expect(getByTestId('bank-account-name')).toBeTruthy();
  });

  it('submit advances to confirmation', () => {
    const u = renderScreen();
    fireEvent.changeText(u.getByTestId('withdraw-amount-input'), '2000');
    fireEvent.press(u.getByTestId('withdraw-continue-btn'));
    fillBank(u);
    fireEvent.press(u.getByTestId('submit-withdrawal-btn'));
    expect(u.getByTestId('confirm-withdrawal-btn')).toBeTruthy();
  });

  it('confirm calls withdraw mutation', () => {
    const u = renderScreen();
    fireEvent.changeText(u.getByTestId('withdraw-amount-input'), '2000');
    fireEvent.press(u.getByTestId('withdraw-continue-btn'));
    fillBank(u);
    fireEvent.press(u.getByTestId('submit-withdrawal-btn'));
    fireEvent.press(u.getByTestId('confirm-withdrawal-btn'));
    expect(mockWithdraw).toHaveBeenCalled();
    expect(u.getByTestId('withdrawal-success')).toBeTruthy();
  });
});
