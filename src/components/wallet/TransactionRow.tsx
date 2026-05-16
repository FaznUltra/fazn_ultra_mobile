import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import type { Transaction, TransactionType } from '../../types/wallet';
import { formatNaira } from '../../utils/wallet';
import { transactionIcon } from './WalletIcons';

const AMBER = '#f59e0b';

const INCOMING: TransactionType[] = [
  'top_up',
  'challenge_win',
  'gift_received',
  'platform_bonus',
];

function iconBg(type: TransactionType): string {
  switch (type) {
    case 'top_up':
    case 'gift_received':
      return colors.success;
    case 'withdrawal':
      return colors.error;
    case 'challenge_win':
      return colors.primary;
    case 'challenge_entry':
      return colors.textMuted;
    case 'gift_sent':
      return colors.primaryLight;
    case 'platform_bonus':
      return AMBER;
    default:
      return colors.surface;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: Props) {
  const Icon = transactionIcon(transaction.type);
  const incoming = INCOMING.includes(transaction.type);
  const isPending = transaction.status === 'pending';
  const isFailed =
    transaction.status === 'failed' || transaction.status === 'reversed';

  let amountColor: string = colors.textPrimary;
  if (isPending) amountColor = colors.textMuted;
  else if (incoming) amountColor = colors.success;
  else amountColor = colors.error;

  const sign = incoming ? '+' : '−';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${sign}${formatNaira(
        transaction.amount,
      )}`}
      testID={`transaction-row-${transaction.id}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg(transaction.type) }]}>
        <Icon size={20} color="#fff" />
      </View>

      <View style={styles.middle}>
        <Text style={styles.desc} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {formatDate(transaction.createdAt)} · {transaction.reference}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {sign}
          {formatNaira(transaction.amount)}
        </Text>
        {(isPending || isFailed) && (
          <View
            style={[
              styles.badge,
              { backgroundColor: isPending ? colors.surface : colors.error },
            ]}
            testID={`transaction-status-${transaction.id}`}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isPending ? colors.textSecondary : '#fff' },
              ]}
            >
              {transaction.status}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  middle: { flex: 1, paddingRight: spacing.sm },
  desc: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  sub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 14, fontWeight: '700' },
  badge: {
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
