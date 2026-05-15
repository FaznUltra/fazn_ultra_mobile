import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ProfileStats } from '../../types/profile';
import { colors, spacing, radius } from '../../theme';

interface StatItemProps {
  value: string;
  label: string;
  accent?: string;
  testID?: string;
}

function StatItem({ value, label, accent = colors.textPrimary, testID }: StatItemProps) {
  return (
    <View style={styles.item} testID={testID}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

interface Props {
  stats: ProfileStats;
  testID?: string;
}

export function StatsRow({ stats, testID }: Props) {
  return (
    <View style={styles.container} testID={testID}>
      <StatItem
        value={stats.totalWins.toString()}
        label="Wins"
        accent={colors.success}
        testID="stat-wins"
      />
      <Divider />
      <StatItem
        value={(stats.totalMatches - stats.totalWins).toString()}
        label="Losses"
        accent={colors.error}
        testID="stat-losses"
      />
      <Divider />
      <StatItem
        value={`${stats.winRate}%`}
        label="Win Rate"
        accent={colors.primaryLight}
        testID="stat-winrate"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
