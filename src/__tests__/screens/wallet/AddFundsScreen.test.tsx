import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddFundsScreen } from '../../../screens/app/wallet/AddFundsScreen';
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
const mockTopUp = jest.fn();

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
    topUp: mockTopUp,
    withdraw: jest.fn(),
    sendGift: jest.fn(),
    refreshWallet: jest.fn(),
  }),
}));

const renderScreen = (params: object = {}) =>
  render(
    <AddFundsScreen
      navigation={mockNavigation as never}
      route={{ params } as never}
    />,
  );

describe('AddFundsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders step 1 with preset amounts', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('add-funds-screen')).toBeTruthy();
    expect(getByTestId('topup-card-1000')).toBeTruthy();
    expect(getByTestId('topup-card-10000')).toBeTruthy();
  });

  it('selecting preset enables continue button', () => {
    const { getByTestId } = renderScreen();
    const btn = getByTestId('add-funds-continue-btn');
    expect(btn.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(getByTestId('topup-card-2500'));
    expect(
      getByTestId('add-funds-continue-btn').props.accessibilityState.disabled,
    ).toBe(false);
  });

  it('entering custom amount updates real equivalent', () => {
    const { getByTestId } = renderScreen();
    fireEvent.changeText(getByTestId('custom-amount-input'), '3000');
    expect(getByTestId('custom-amount-equiv')).toBeTruthy();
  });

  it('continue advances to step 2', () => {
    const { getByTestId } = renderScreen({ preselectedAmount: 2500 });
    fireEvent.press(getByTestId('add-funds-continue-btn'));
    expect(getByTestId('payment-method-list')).toBeTruthy();
  });

  it('selecting payment method enables pay now', () => {
    const { getByTestId } = renderScreen({ preselectedAmount: 2500 });
    fireEvent.press(getByTestId('add-funds-continue-btn'));
    const pay = getByTestId('pay-now-btn');
    expect(pay.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(getByTestId('payment-method-paystack_card'));
    expect(
      getByTestId('pay-now-btn').props.accessibilityState.disabled,
    ).toBe(false);
  });
});
