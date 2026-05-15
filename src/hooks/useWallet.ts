import { useState, useEffect, useCallback } from 'react';
import type {
  WalletData,
  Transaction,
  PaymentMethod,
} from '../types/wallet';
import type { BankDetails, WithdrawalMethod } from '../types/wallet';
import { ftToBuyReal, ftToSellReal } from '../utils/wallet';

/**
 * Mock data — shape defines the backend contract.
 * Backend: GET /api/v1/wallet → WalletData
 * Nigerian user.
 */
const MOCK_WALLET: WalletData = {
  ftBalance: 12450,
  pendingFt: 200,
  totalWon: 45200,
  totalSpent: 32750,
  currency: 'NGN',
  country: 'NG',
  availablePaymentMethods: [
    'paystack_card',
    'paystack_bank',
    'paystack_ussd',
    'bank_transfer',
  ],
  transactions: [
    {
      id: 'tx1',
      type: 'top_up',
      status: 'completed',
      ftAmount: 2500,
      realAmount: 37500,
      currency: 'NGN',
      description: 'Wallet top-up',
      reference: 'TP-9F2A41',
      createdAt: '2026-05-15T09:12:00Z',
      metadata: { paymentMethod: 'paystack_card', accountLast4: '4242' },
    },
    {
      id: 'tx2',
      type: 'challenge_win',
      status: 'completed',
      ftAmount: 5000,
      realAmount: 67500,
      currency: 'NGN',
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
      ftAmount: 1000,
      realAmount: 15000,
      currency: 'NGN',
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
      ftAmount: 500,
      realAmount: 7500,
      currency: 'NGN',
      description: 'Gift from techboss_uk',
      reference: 'GF-44C901',
      createdAt: '2026-05-14T15:22:00Z',
      metadata: { sender: 'techboss_uk' },
    },
    {
      id: 'tx5',
      type: 'withdrawal',
      status: 'pending',
      ftAmount: 200,
      realAmount: 2700,
      currency: 'NGN',
      description: 'Withdrawal to GTBank',
      reference: 'WD-22DEF0',
      createdAt: '2026-05-14T11:00:00Z',
      metadata: { bankName: 'GTBank', accountLast4: '8821' },
    },
    {
      id: 'tx6',
      type: 'platform_bonus',
      status: 'completed',
      ftAmount: 1000,
      realAmount: 0,
      currency: 'NGN',
      description: 'Welcome bonus',
      reference: 'PB-000001',
      createdAt: '2026-05-13T08:00:00Z',
    },
    {
      id: 'tx7',
      type: 'challenge_entry',
      status: 'completed',
      ftAmount: 750,
      realAmount: 11250,
      currency: 'NGN',
      description: 'Entry — NBA Slam Dunk League',
      reference: 'CE-9930CC',
      createdAt: '2026-05-12T19:30:00Z',
      metadata: { challengeTitle: 'NBA Slam Dunk League' },
    },
    {
      id: 'tx8',
      type: 'challenge_win',
      status: 'completed',
      ftAmount: 3500,
      realAmount: 47250,
      currency: 'NGN',
      description: 'Won challenge vs j_buckets',
      reference: 'CW-5521AB',
      createdAt: '2026-05-12T21:10:00Z',
      metadata: { opponent: 'j_buckets', challengeTitle: 'NBA Slam Dunk League' },
    },
    {
      id: 'tx9',
      type: 'gift_sent',
      status: 'completed',
      ftAmount: 300,
      realAmount: 4500,
      currency: 'NGN',
      description: 'Gift to nova_player',
      reference: 'GF-71A0FF',
      createdAt: '2026-05-11T13:45:00Z',
      metadata: { sender: 'nova_player' },
    },
    {
      id: 'tx10',
      type: 'top_up',
      status: 'failed',
      ftAmount: 5000,
      realAmount: 75000,
      currency: 'NGN',
      description: 'Wallet top-up failed',
      reference: 'TP-FA1L00',
      createdAt: '2026-05-10T17:20:00Z',
      metadata: { paymentMethod: 'paystack_bank' },
    },
    {
      id: 'tx11',
      type: 'top_up',
      status: 'completed',
      ftAmount: 10000,
      realAmount: 150000,
      currency: 'NGN',
      description: 'Wallet top-up',
      reference: 'TP-AA9921',
      createdAt: '2026-05-08T10:05:00Z',
      metadata: { paymentMethod: 'paystack_ussd' },
    },
    {
      id: 'tx12',
      type: 'challenge_entry',
      status: 'reversed',
      ftAmount: 500,
      realAmount: 7500,
      currency: 'NGN',
      description: 'Entry refunded — cancelled match',
      reference: 'CE-RV0011',
      createdAt: '2026-05-07T22:00:00Z',
      metadata: { challengeTitle: 'Quick 1v1' },
    },
    {
      id: 'tx13',
      type: 'challenge_win',
      status: 'completed',
      ftAmount: 2000,
      realAmount: 27000,
      currency: 'NGN',
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
    async (ftAmount: number, paymentMethod: PaymentMethod) => {
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        const tx: Transaction = {
          id: makeRef('tx'),
          type: 'top_up',
          status: 'pending',
          ftAmount,
          realAmount: ftToBuyReal(ftAmount, prev.data.currency),
          currency: prev.data.currency,
          description: 'Wallet top-up',
          reference: makeRef('TP'),
          createdAt: new Date().toISOString(),
          metadata: { paymentMethod },
        };
        return {
          status: 'success',
          data: {
            ...prev.data,
            pendingFt: prev.data.pendingFt + ftAmount,
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
      ftAmount: number,
      method: WithdrawalMethod,
      bankDetails: BankDetails,
    ) => {
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        const tx: Transaction = {
          id: makeRef('tx'),
          type: 'withdrawal',
          status: 'pending',
          ftAmount,
          realAmount: ftToSellReal(ftAmount, prev.data.currency),
          currency: prev.data.currency,
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
            ftBalance: prev.data.ftBalance - ftAmount,
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

  const sendGift = useCallback(
    async (recipientUserId: string, ftAmount: number) => {
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        const tx: Transaction = {
          id: makeRef('tx'),
          type: 'gift_sent',
          status: 'completed',
          ftAmount,
          realAmount: ftToSellReal(ftAmount, prev.data.currency),
          currency: prev.data.currency,
          description: `Gift to ${recipientUserId}`,
          reference: makeRef('GF'),
          createdAt: new Date().toISOString(),
          metadata: { sender: recipientUserId },
        };
        return {
          status: 'success',
          data: {
            ...prev.data,
            ftBalance: prev.data.ftBalance - ftAmount,
            transactions: [tx, ...prev.data.transactions],
          },
        };
      });
      await new Promise((r) => setTimeout(r, 400));
    },
    [],
  );

  return { state, topUp, withdraw, sendGift, refreshWallet };
}
