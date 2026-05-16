import { useState, useEffect, useCallback } from 'react';
import type {
  WalletData,
  Transaction,
  PaymentMethod,
} from '../types/wallet';
import type { BankDetails, WithdrawalMethod } from '../types/wallet';

/**
 * Mock data — shape defines the backend contract.
 * Backend: GET /api/v1/wallet → WalletData
 * Nigerian user. All amounts in Naira (₦).
 */
const MOCK_WALLET: WalletData = {
  balance: 12500,
  pendingAmount: 200,
  totalWon: 45200,
  totalSpent: 32750,
  transactions: [
    {
      id: 'tx1',
      type: 'top_up',
      status: 'completed',
      amount: 2500,
      description: 'Wallet top-up',
      reference: 'TP-9F2A41',
      createdAt: '2026-05-15T09:12:00Z',
      metadata: { paymentMethod: 'paystack_card', accountLast4: '4242' },
    },
    {
      id: 'tx2',
      type: 'challenge_win',
      status: 'completed',
      amount: 5000,
      description: 'Won challenge vs sniperghost',
      reference: 'CW-77B210',
      createdAt: '2026-05-15T03:40:00Z',
      metadata: {
        opponent: 'sniperghost',
        challengeTitle: 'COD Warzone Invitational',
      },
    },
    {
      id: 'tx3',
      type: 'challenge_entry',
      status: 'completed',
      amount: 1000,
      description: 'Entry — COD Warzone Invitational',
      reference: 'CE-1180AA',
      createdAt: '2026-05-14T20:05:00Z',
      metadata: {
        opponent: 'sniperghost',
        challengeTitle: 'COD Warzone Invitational',
      },
    },
    {
      id: 'tx4',
      type: 'gift_received',
      status: 'completed',
      amount: 500,
      description: 'Gift from techboss_uk',
      reference: 'GF-44C901',
      createdAt: '2026-05-14T15:22:00Z',
      metadata: { sender: 'techboss_uk' },
    },
    {
      id: 'tx5',
      type: 'withdrawal',
      status: 'pending',
      amount: 200,
      description: 'Withdrawal to GTBank',
      reference: 'WD-22DEF0',
      createdAt: '2026-05-14T11:00:00Z',
      metadata: { bankName: 'GTBank', accountLast4: '8821' },
    },
    {
      id: 'tx6',
      type: 'platform_bonus',
      status: 'completed',
      amount: 1000,
      description: 'Welcome bonus',
      reference: 'PB-000001',
      createdAt: '2026-05-13T08:00:00Z',
    },
    {
      id: 'tx7',
      type: 'challenge_entry',
      status: 'completed',
      amount: 750,
      description: 'Entry — NBA Slam Dunk League',
      reference: 'CE-9930CC',
      createdAt: '2026-05-12T19:30:00Z',
      metadata: { challengeTitle: 'NBA Slam Dunk League' },
    },
    {
      id: 'tx8',
      type: 'challenge_win',
      status: 'completed',
      amount: 3500,
      description: 'Won challenge vs j_buckets',
      reference: 'CW-5521AB',
      createdAt: '2026-05-12T21:10:00Z',
      metadata: { opponent: 'j_buckets', challengeTitle: 'NBA Slam Dunk League' },
    },
    {
      id: 'tx9',
      type: 'gift_sent',
      status: 'completed',
      amount: 300,
      description: 'Gift to nova_player',
      reference: 'GF-71A0FF',
      createdAt: '2026-05-11T13:45:00Z',
      metadata: { sender: 'nova_player' },
    },
    {
      id: 'tx10',
      type: 'top_up',
      status: 'failed',
      amount: 5000,
      description: 'Wallet top-up failed',
      reference: 'TP-FA1L00',
      createdAt: '2026-05-10T17:20:00Z',
      metadata: { paymentMethod: 'paystack_bank' },
    },
    {
      id: 'tx11',
      type: 'top_up',
      status: 'completed',
      amount: 10000,
      description: 'Wallet top-up',
      reference: 'TP-AA9921',
      createdAt: '2026-05-08T10:05:00Z',
      metadata: { paymentMethod: 'paystack_ussd' },
    },
    {
      id: 'tx12',
      type: 'challenge_entry',
      status: 'reversed',
      amount: 500,
      description: 'Entry refunded — cancelled match',
      reference: 'CE-RV0011',
      createdAt: '2026-05-07T22:00:00Z',
      metadata: { challengeTitle: 'Quick 1v1' },
    },
    {
      id: 'tx13',
      type: 'challenge_win',
      status: 'completed',
      amount: 2000,
      description: 'Won challenge vs kingjames23',
      reference: 'CW-3340DE',
      createdAt: '2026-05-06T18:15:00Z',
      metadata: { opponent: 'kingjames23', challengeTitle: 'Weekend Warriors Cup' },
    },
  ],
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WalletData }
  | { status: 'error'; message: string };

async function fetchWallet(): Promise<WalletData> {
  await new Promise((r) => setTimeout(r, 700));
  return MOCK_WALLET;
}

function makeRef(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function useWallet() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchWallet();
      setState({ status: 'success', data });
    } catch {
      setState({
        status: 'error',
        message: 'Failed to load wallet. Tap to retry.',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshWallet = useCallback(async () => {
    try {
      const data = await fetchWallet();
      setState({ status: 'success', data });
    } catch {
      setState({
        status: 'error',
        message: 'Failed to load wallet. Tap to retry.',
      });
    }
  }, []);

  const topUp = useCallback(
    async (amount: number, paymentMethod: PaymentMethod) => {
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        const tx: Transaction = {
          id: makeRef('tx'),
          type: 'top_up',
          status: 'pending',
          amount,
          description: 'Wallet top-up',
          reference: makeRef('TP'),
          createdAt: new Date().toISOString(),
          metadata: { paymentMethod },
        };
        return {
          status: 'success',
          data: {
            ...prev.data,
            pendingAmount: prev.data.pendingAmount + amount,
            transactions: [tx, ...prev.data.transactions],
          },
        };
      });
      await new Promise((r) => setTimeout(r, 600));
    },
    [],
  );

  const withdraw = useCallback(
    async (
      amount: number,
      method: WithdrawalMethod,
      bankDetails: BankDetails,
    ) => {
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        const tx: Transaction = {
          id: makeRef('tx'),
          type: 'withdrawal',
          status: 'pending',
          amount,
          description: `Withdrawal to ${bankDetails.bankName}`,
          reference: makeRef('WD'),
          createdAt: new Date().toISOString(),
          metadata: {
            bankName: bankDetails.bankName,
            accountLast4: bankDetails.accountNumber.slice(-4),
          },
        };
        return {
          status: 'success',
          data: {
            ...prev.data,
            balance: prev.data.balance - amount,
            transactions: [tx, ...prev.data.transactions],
          },
        };
      });
      await new Promise((r) => setTimeout(r, 600));
      // method retained for backend contract; suppress unused lint
      void method;
    },
    [],
  );

  return { state, topUp, withdraw, refreshWallet };
}
