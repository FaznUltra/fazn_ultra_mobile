import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import type { TopUpOption } from '../../types/wallet';
import { formatFt, formatReal } from '../../utils/wallet';

interface Props {
  option: TopUpOption;
  selected?: boolean;
  onPress: () => void;
  style?: object;
}

export function TopUpCard({ option, selected = false, onPress, style }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Top up ${formatFt(option.ftAmount)}`}
      accessibilityState={{ selected }}
      style={[styles.card, selected && styles.cardSelected, style]}
      testID={`topup-card-${option.ftAmount}`}
    >
      {option.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}

      <Text style={styles.ft}>{formatFt(option.ftAmount)}</Text>
      <Text style={styles.real}>
        {formatReal(option.realAmount, option.currency)}
      </Text>

      {option.bonus ? (
        <Text style={styles.bonus}>+{option.bonus} FT FREE</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    minHeight: 90,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  popularText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  ft: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  real: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  bonus: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
