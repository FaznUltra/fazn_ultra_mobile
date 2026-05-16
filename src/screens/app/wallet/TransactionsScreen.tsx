import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { colors, spacing } from '../../../theme';
import { useWallet } from '../../../hooks/useWallet';
import { walletApi, ApiError } from '../../../lib/api';
import { TransactionRow } from '../../../components/wallet/TransactionRow';
import {
  ChevronLeftIcon,
  FilterIcon,
} from '../../../components/wallet/WalletIcons';
import type { Transaction, TransactionType } from '../../../types/wallet';

type Props = NativeStackScreenProps<HomeStackParamList, 'Transactions'>;

const PAGE_SIZE = 20;

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

function dedupe(list: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  const out: Transaction[] = [];
  for (const tx of list) {
    if (seen.has(tx.id)) continue;
    seen.add(tx.id);
    out.push(tx);
  }
  return out;
}

export function TransactionsScreen({ navigation }: Props) {
  const { state, refreshWallet } = useWallet();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state. Seeded from the wallet's first page, then extended
  // via the paginated /wallet/transactions endpoint as the user scrolls.
  const [extraPages, setExtraPages] = useState<Transaction[]>([]);
  const [nextPage, setNextPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const baseTransactions =
    state.status === 'success' ? state.data.transactions : [];

  const transactions = useMemo(
    () => dedupe([...baseTransactions, ...extraPages]),
    [baseTransactions, extraPages],
  );

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const res = await walletApi.getTransactions(nextPage, PAGE_SIZE);
      setExtraPages((prev) => dedupe([...prev, ...res.transactions]));
      setNextPage((p) => p + 1);
      const loadedCount =
        baseTransactions.length + extraPages.length + res.transactions.length;
      if (res.transactions.length === 0 || loadedCount >= res.total) {
        setHasMore(false);
      }
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Could not load more transactions.',
      );
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, nextPage]);

  // Reset pagination whenever the wallet base list reloads (pull-to-refresh).
  useEffect(() => {
    setExtraPages([]);
    setNextPage(2);
    setHasMore(true);
    setLoadError(null);
  }, [baseTransactions]);

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

  const renderFooter = () => {
    if (loadError) {
      return (
        <TouchableOpacity
          style={styles.footer}
          onPress={loadMore}
          accessibilityRole="button"
          testID="transactions-load-error"
        >
          <Text style={styles.footerError}>{loadError}</Text>
          <Text style={styles.footerLink}>Tap to retry</Text>
        </TouchableOpacity>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footer} testID="transactions-loading-more">
          <ActivityIndicator color={colors.primaryLight} />
        </View>
      );
    }
    if (!hasMore && items.length > 0) {
      return (
        <View style={styles.footer} testID="transactions-end">
          <Text style={styles.footerEnd}>No more transactions</Text>
        </View>
      );
    }
    return null;
  };

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

      {state.status === 'loading' ? (
        <View style={styles.empty} testID="transactions-loading">
          <ActivityIndicator color={colors.primaryLight} />
        </View>
      ) : state.status === 'error' ? (
        <TouchableOpacity
          style={styles.empty}
          onPress={onRefresh}
          accessibilityRole="button"
          testID="transactions-error"
        >
          <Text style={styles.emptyText}>{state.message}</Text>
        </TouchableOpacity>
      ) : items.length === 0 ? (
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
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (filter === 'all') void loadMore();
          }}
          ListFooterComponent={renderFooter}
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
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerError: { color: colors.error, fontSize: 13, textAlign: 'center' },
  footerLink: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  footerEnd: { color: colors.textMuted, fontSize: 12 },
});
