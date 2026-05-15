import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WalletScreen } from '../../../screens/app/wallet/WalletScreen';
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

const DATA: WalletData = {
  ftBalance: 12450,
  pendingFt: 200,
  totalWon: 45200,
  totalSpent: 32750,
  currency: 'NGN',
  country: 'NG',
  availablePaymentMethods: ['paystack_card'],
  transactions: [
    {
      id: 'tx1',
      type: 'top_up',
      status: 'completed',
      ftAmount: 2500,
      realAmount: 37500,
      currency: 'NGN',
      description: 'Wallet top-up',
      reference: 'TP-1',
      createdAt: '2026-05-15T09:12:00Z',
    },
  ],
};

let mockState: object = { status: 'success', data: DATA };

jest.mock('../../../hooks/useWallet', () => ({
  useWallet: () => ({
    state: mockState,
    topUp: jest.fn(),
    withdraw: jest.fn(),
    sendGift: jest.fn(),
    refreshWallet: jest.fn(),
  }),
}));

const renderScreen = () =>
  render(
    <WalletScreen navigation={mockNavigation as never} route={{} as never} />,
  );

describe('WalletScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { status: 'success', data: DATA };
  });

  it('renders balance and pending amount', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('wallet-screen')).toBeTruthy();
    expect(getByTestId('wallet-balance').props.children).toContain('12,450');
    expect(getByTestId('wallet-pending')).toBeTruthy();
  });

  it('renders quick top-up cards', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('wallet-quick-topup')).toBeTruthy();
    expect(getByTestId('topup-card-2500')).toBeTruthy();
  });

  it('renders recent transactions', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('wallet-transactions-preview')).toBeTruthy();
    expect(getByTestId('transaction-row-tx1')).toBeTruthy();
  });

  it('add FT button navigates to AddFunds', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('wallet-add-btn'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddFunds', {});
  });

  it('withdraw button navigates to Withdraw', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('wallet-withdraw-btn'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Withdraw');
  });

  it('see all navigates to Transactions', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('see-all-transactions'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Transactions');
  });
});
