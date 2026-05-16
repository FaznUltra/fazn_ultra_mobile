import React from 'react';
import { render } from '@testing-library/react-native';
import { TransactionRow } from '../../../components/wallet/TransactionRow';
import type { Transaction } from '../../../types/wallet';

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

const base: Transaction = {
  id: 'tx1',
  type: 'top_up',
  status: 'completed',
  amount: 2500,
  description: 'Wallet top-up',
  reference: 'TP-9F2A41',
  createdAt: '2026-05-15T09:12:00Z',
};

describe('TransactionRow', () => {
  it('renders incoming transaction with green amount (+)', () => {
    const { getByText, getByTestId } = render(
      <TransactionRow transaction={base} />,
    );
    expect(getByTestId('transaction-row-tx1')).toBeTruthy();
    expect(getByText('+₦2,500')).toBeTruthy();
  });

  it('renders outgoing with red amount (−)', () => {
    const { getByText } = render(
      <TransactionRow
        transaction={{ ...base, id: 'tx2', type: 'withdrawal' }}
      />,
    );
    expect(getByText('−₦2,500')).toBeTruthy();
  });

  it('renders pending status badge', () => {
    const { getByTestId } = render(
      <TransactionRow
        transaction={{ ...base, id: 'tx3', status: 'pending' }}
      />,
    );
    expect(getByTestId('transaction-status-tx3')).toBeTruthy();
  });
});
