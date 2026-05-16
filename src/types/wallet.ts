export type TransactionType =
  | 'top_up'
  | 'withdrawal'
  | 'challenge_entry'
  | 'challenge_win'
  | 'gift_sent'
  | 'gift_received'
  | 'platform_bonus';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
export type PaymentMethod =
  | 'paystack_card'
  | 'paystack_bank'
  | 'paystack_ussd'
  | 'bank_transfer';
export type WithdrawalMethod = 'bank_transfer' | 'paystack_nuban';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Naira
  description: string;
  reference: string;
  createdAt: string;
  metadata?: {
    opponent?: string; // for challenge transactions
    challengeTitle?: string;
    sender?: string; // for gifts
    paymentMethod?: PaymentMethod;
    bankName?: string;
    accountLast4?: string;
  };
}

export interface WalletData {
  balance: number; // Naira
  pendingAmount: number; // Naira in pending transactions
  totalWon: number; // lifetime Naira won
  totalSpent: number; // lifetime Naira spent
  transactions: Transaction[];
}

export interface TopUpOption {
  amount: number; // Naira
  label: string; // e.g. "₦5,000"
  popular?: boolean;
  bonus?: number; // bonus Naira (e.g. ₦500 free on large top-ups)
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}
