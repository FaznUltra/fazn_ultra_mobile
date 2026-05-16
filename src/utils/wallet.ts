import type { Currency, TopUpOption } from '../types/wallet';

/** Buy rate: $1 = 100 FT. Sell rate: 100 FT = $0.90. */
const BUY_RATE: Record<Currency, number> = {
  USD: 1 / 100, // 1 FT -> 0.01 USD
  NGN: 1500 / 100, // 1 FT -> 15 NGN
  GBP: 0.8 / 100,
  EUR: 0.92 / 100,
};

const SELL_RATE: Record<Currency, number> = {
  USD: 0.9 / 100, // 100 FT -> 0.90 USD
  NGN: 1350 / 100, // 100 FT -> 1350 NGN
  GBP: 0.72 / 100,
  EUR: 0.83 / 100,
};

const SYMBOL: Record<Currency, string> = {
  USD: '$',
  NGN: '₦',
  GBP: '£',
  EUR: '€',
};

export function currencySymbol(currency: Currency): string {
  return SYMBOL[currency];
}

export function formatFt(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-US')} Tokens`;
}

/** FT -> real money the user pays to buy that FT. */
export function ftToBuyReal(ftAmount: number, currency: Currency): number {
  return ftAmount * BUY_RATE[currency];
}

/** FT -> real money the user receives when cashing out that FT. */
export function ftToSellReal(ftAmount: number, currency: Currency): number {
  return ftAmount * SELL_RATE[currency];
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export function topUpPresets(currency: Currency): TopUpOption[] {
  return PRESET_AMOUNTS.map((ftAmount) => ({
    ftAmount,
    realAmount: ftToBuyReal(ftAmount, currency),
    currency,
    label: formatFt(ftAmount),
    popular: ftAmount === 2500,
    bonus: ftAmount >= 5000 ? Math.round(ftAmount * 0.05) : undefined,
  }));
}

export function formatReal(amount: number, currency: Currency): string {
  const fractionDigits = currency === 'NGN' ? 0 : 2;
  return `${SYMBOL[currency]}${amount.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}
