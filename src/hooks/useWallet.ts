import { useState, useEffect, useCallback } from 'react';
import type {
  WalletData,
  PaymentMethod,
  BankDetails,
  WithdrawalMethod,
  Transaction,
} from '../types/wallet';
import { walletApi, ApiError } from '../lib/api';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WalletData }
  | { status: 'error'; message: string };

const GENERIC_ERROR = 'Failed to load wallet. Tap to retry.';

export function useWallet() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await walletApi.getWallet();
      setState({ status: 'success', data });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof ApiError ? err.message : GENERIC_ERROR,
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshWallet = useCallback(async () => {
    try {
      const data = await walletApi.getWallet();
      setState({ status: 'success', data });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof ApiError ? err.message : GENERIC_ERROR,
      });
    }
  }, []);

  const topUp = useCallback(
    async (amount: number, paymentMethod: PaymentMethod) => {
      const resp = await walletApi.initializeTopUp(amount, paymentMethod);
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        const newTx: Transaction = {
          id: resp.reference,
          type: 'top_up',
          status: 'pending',
          amount,
          description: 'Wallet top-up',
          reference: resp.reference,
          createdAt: new Date().toISOString(),
          metadata: { paymentMethod },
        };
        return {
          status: 'success',
          data: {
            ...prev.data,
            pendingAmount: prev.data.pendingAmount + amount,
            transactions: [newTx, ...prev.data.transactions],
          },
        };
      });
      return resp;
    },
    [],
  );

  const withdraw = useCallback(
    async (amount: number, _method: WithdrawalMethod, bankDetails: BankDetails) => {
      const resp = await walletApi.requestWithdrawal({
        amount,
        accountName: bankDetails.accountName,
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName,
      });
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        return {
          status: 'success',
          data: {
            ...prev.data,
            balance: prev.data.balance - amount,
            transactions: [resp.transaction, ...prev.data.transactions],
          },
        };
      });
    },
    [],
  );

  return { state, topUp, withdraw, refreshWallet };
}
