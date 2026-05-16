import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TransactionsScreen } from '../../../screens/app/wallet/TransactionsScreen';
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
const mockRefresh = jest.fn().mockResolvedValue(undefined);

const mockData: WalletData = {
  balance: 12500,
  pendingAmount: 0,
  totalWon: 0,
  totalSpent: 0,
  transactions: [
    {
      id: 'tx1',
      type: 'top_up',
      status: 'completed',
      amount: 2500,
      description: 'Wallet top-up',
      reference: 'TP-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx2',
      type: 'withdrawal',
      status: 'pending',
      amount: 1000,
      description: 'Withdrawal to GTBank',
      reference: 'WD-1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

jest.mock('../../../hooks/useWallet', () => ({
  useWallet: () => ({
    state: { status: 'success', data: mockData },
    topUp: jest.fn(),
    withdraw: jest.fn(),
    sendGift: jest.fn(),
    refreshWallet: mockRefresh,
  }),
}));

const renderScreen = () =>
  render(
    <TransactionsScreen
      navigation={mockNavigation as never}
      route={{} as never}
    />,
  );

describe('TransactionsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders grouped transactions', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('transactions-screen')).toBeTruthy();
    expect(getByTestId('transactions-list')).toBeTruthy();
    expect(getByTestId('transaction-row-tx1')).toBeTruthy();
  });

  it('filter pills change displayed transactions', () => {
    const { getByTestId, queryByTestId } = renderScreen();
    fireEvent.press(getByTestId('filter-pill-withdrawal'));
    expect(queryByTestId('transaction-row-tx1')).toBeNull();
    expect(getByTestId('transaction-row-tx2')).toBeTruthy();
  });

  it('pull to refresh calls refreshWallet', () => {
    const { getByTestId } = renderScreen();
    const list = getByTestId('transactions-list');
    list.props.refreshControl.props.onRefresh();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
