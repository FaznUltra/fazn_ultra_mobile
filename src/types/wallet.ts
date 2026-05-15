export type Currency = 'USD' | 'NGN' | 'GBP' | 'EUR';
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
  | 'stripe_card'
  | 'bank_transfer';
export type WithdrawalMethod = 'bank_transfer' | 'paystack_nuban';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  ftAmount: number; // FazToken amount
  realAmount: number; // real currency equivalent
  currency: Currency;
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
  ftBalance: number;
  pendingFt: number; // FT in pending transactions
  totalWon: number; // lifetime FT won
  totalSpent: number; // lifetime FT spent
  currency: Currency;
  country: string; // ISO 3166-1 alpha-2
  transactions: Transaction[];
  availablePaymentMethods: PaymentMethod[];
}

export interface TopUpOption {
  ftAmount: number;
  realAmount: number;
  currency: Currency;
  label: string; // e.g. "500 FT"
  bonus?: number; // bonus FT (e.g. 50 FT free)
  popular?: boolean;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  sortCode?: string; // UK
  routingNumber?: string; // US
  swiftCode?: string;
}
