import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { colors, spacing } from '../../../theme';
import { useWallet } from '../../../hooks/useWallet';
import { TransactionRow } from '../../../components/wallet/TransactionRow';
import {
  ChevronLeftIcon,
  FilterIcon,
} from '../../../components/wallet/WalletIcons';
import type { Transaction, TransactionType } from '../../../types/wallet';

type Props = NativeStackScreenProps<HomeStackParamList, 'Transactions'>;

type FilterKey =
  | 'all'
  | 'top_up'
  | 'withdrawal'
  | 'winnings'
  | 'gifts'
  | 'bonuses';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'top_up', label: 'Top-ups' },
  { key: 'withdrawal', label: 'Withdrawals' },
  { key: 'winnings', label: 'Winnings' },
  { key: 'gifts', label: 'Gifts' },
  { key: 'bonuses', label: 'Bonuses' },
];

function matchesFilter(t: TransactionType, f: FilterKey): boolean {
  switch (f) {
    case 'all':
      return true;
    case 'top_up':
      return t === 'top_up';
    case 'withdrawal':
      return t === 'withdrawal';
    case 'winnings':
      return t === 'challenge_win' || t === 'challenge_entry';
    case 'gifts':
      return t === 'gift_sent' || t === 'gift_received';
    case 'bonuses':
      return t === 'platform_bonus';
  }
}

function groupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(d)) / 86400000,
  );
  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff <= 7) return 'This Week';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

type Item =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'row'; id: string; tx: Transaction };

export function TransactionsScreen({ navigation }: Props) {
  const { state, refreshWallet } = useWallet();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const transactions =
    state.status === 'success' ? state.data.transactions : [];

  const items = useMemo<Item[]>(() => {
    const filtered = transactions.filter((t) =>
      matchesFilter(t.type, filter),
    );
    const out: Item[] = [];
    let lastLabel = '';
    for (const tx of filtered) {
      const label = groupLabel(tx.createdAt);
      if (label !== lastLabel) {
        out.push({ kind: 'header', id: `h-${label}`, label });
        lastLabel = label;
      }
      out.push({ kind: 'row', id: tx.id, tx });
    }
    return out;
  }, [transactions, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  };

  const currentLabel =
    FILTERS.find((f) => f.key === filter)?.label.toLowerCase() ?? 'all';

  return (
    <ScreenContainer testID="transactions-screen" noScroll>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="transactions-back-btn"
        >
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transactions</Text>
        <FilterIcon size={22} color={colors.textSecondary} />
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setFilter(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                testID={`filter-pill-${f.key}`}
              >
                <Text
                  style={[styles.pillText, active && styles.pillTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty} testID="transactions-empty">
          <Text style={styles.emptyText}>
            No {currentLabel === 'all' ? '' : currentLabel + ' '}transactions
            yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          testID="transactions-list"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryLight}
              testID="transactions-refresh"
            />
          }
          renderItem={({ item }) =>
            item.kind === 'header' ? (
              <Text style={styles.groupHeader}>{item.label}</Text>
            ) : (
              <View style={styles.rowWrap}>
                <TransactionRow transaction={item.tx} />
              </View>
            )
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  filterWrap: { paddingBottom: spacing.md },
  filterRow: { paddingHorizontal: 20, gap: spacing.sm },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: spacing.xl },
  groupHeader: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  rowWrap: { marginBottom: spacing.xs },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
