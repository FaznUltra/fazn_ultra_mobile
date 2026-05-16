import type { TopUpOption } from '../types/wallet';

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export const TOP_UP_PRESETS: TopUpOption[] = [
  { amount: 1000, label: '₦1,000' },
  { amount: 2500, label: '₦2,500' },
  { amount: 5000, label: '₦5,000', popular: true },
  { amount: 10000, label: '₦10,000', bonus: 500 },
  { amount: 25000, label: '₦25,000', bonus: 2000 },
];

export const MIN_WITHDRAWAL = 1000; // Naira
export const WITHDRAWAL_FEE = 100; // Naira flat fee
