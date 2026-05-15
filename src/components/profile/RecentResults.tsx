import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RecentResult, ResultOutcome } from '../../types/profile';
import { colors, spacing, radius } from '../../theme';

const OUTCOME_CONFIG: Record<ResultOutcome, { label: string; color: string; bg: string }> = {
  win: { label: 'W', color: colors.success, bg: colors.success + '22' },
  loss: { label: 'L', color: colors.error, bg: colors.error + '22' },
  draw: { label: 'D', color: colors.textSecondary, bg: colors.border },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function ResultRow({ result }: { result: RecentResult }) {
  const cfg = OUTCOME_CONFIG[result.outcome];
  return (
    <View style={styles.row} testID={`result-row-${result.id}`}>
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.gameName}>{result.gameName}</Text>
        <Text style={styles.opponent}>vs @{result.opponentUsername}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.score}>{result.score}</Text>
        <Text style={styles.date}>{formatDate(result.playedAt)}</Text>
      </View>
    </View>
  );
}

interface Props {
  results: RecentResult[];
  testID?: string;
}

export function RecentResults({ results, testID }: Props) {
  if (results.length === 0) {
    return (
      <View style={styles.empty} testID={testID}>
        <Text style={styles.emptyText}>No recent matches.</Text>
        <Text style={styles.emptyHint}>Your last 5 results will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card} testID={testID}>
      {results.slice(0, 5).map((r, idx) => (
        <React.Fragment key={r.id}>
          <ResultRow result={r} />
          {idx < Math.min(results.length, 5) - 1 && <View style={styles.sep} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  info: { flex: 1 },
  gameName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  opponent: {
    color: colors.textMuted,
    fontSize: 12,
  },
  right: { alignItems: 'flex-end' },
  score: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    color: colors.textMuted,
    fontSize: 11,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
