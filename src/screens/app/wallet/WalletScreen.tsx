import React, { useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { colors, spacing, radius } from '../../../theme';
import { useWallet } from '../../../hooks/useWallet';
import { TopUpCard } from '../../../components/wallet/TopUpCard';
import { TransactionRow } from '../../../components/wallet/TransactionRow';
import { ChevronLeftIcon } from '../../../components/wallet/WalletIcons';
import { formatNaira, TOP_UP_PRESETS } from '../../../utils/wallet';

type Props = NativeStackScreenProps<HomeStackParamList, 'WalletMain'>;

export function WalletScreen({ navigation }: Props) {
  const { state, refreshWallet } = useWallet();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Re-fetch balance every time this screen comes into focus so it's
  // always fresh after returning from AddFunds / Withdraw.
  useFocusEffect(React.useCallback(() => { void refreshWallet(); }, [refreshWallet]));

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.centered} testID="wallet-loading">
          <Text style={styles.muted}>Loading wallet…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={['top', 'left', 'right']}
        testID="wallet-screen"
      >
        <View style={styles.centered} testID="wallet-error">
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.muted}>{state.message}</Text>
          <TouchableOpacity
            onPress={refreshWallet}
            style={styles.retryBtn}
            accessibilityRole="button"
            testID="wallet-retry"
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { data } = state;
  const presets = TOP_UP_PRESETS;
  const recent = data.transactions.slice(0, 5);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });
  const headerScale = scrollY.interpolate({
    inputRange: [-80, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="wallet-screen"
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Parallax header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, transform: [{ scale: headerScale }] },
          ]}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              testID="wallet-back-btn"
              style={styles.backBtn}
            >
              <ChevronLeftIcon size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Wallet</Text>
            <View style={styles.backBtn} />
          </View>

          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balance} testID="wallet-balance">
            {formatNaira(data.balance)}
          </Text>

          {data.pendingAmount > 0 && (
            <View style={styles.pendingBadge} testID="wallet-pending">
              <Text style={styles.pendingText}>
                ⏳ {formatNaira(data.pendingAmount)} pending
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionFilled]}
              onPress={() => navigation.navigate('AddFunds', {})}
              accessibilityRole="button"
              accessibilityLabel="Add Money"
              testID="wallet-add-btn"
            >
              <Text style={styles.actionFilledText}>+ Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionOutline]}
              onPress={() => navigation.navigate('Withdraw')}
              accessibilityRole="button"
              accessibilityLabel="Withdraw"
              testID="wallet-withdraw-btn"
            >
              <Text style={styles.actionOutlineText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.statRow}>
            Won {formatNaira(data.totalWon)} · Spent{' '}
            {formatNaira(data.totalSpent)}
          </Text>
        </Animated.View>

        <View style={styles.body}>
          {/* Quick top-up */}
          <Text style={styles.sectionTitle}>Quick Top-up</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topupRow}
            testID="wallet-quick-topup"
          >
            {presets.map((opt) => (
              <TopUpCard
                key={opt.amount}
                option={opt}
                onPress={() =>
                  navigation.navigate('AddFunds', {
                    preselectedAmount: opt.amount,
                  })
                }
              />
            ))}
          </ScrollView>

          {/* Recent transactions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
              accessibilityRole="button"
              testID="see-all-transactions"
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={styles.empty} testID="wallet-transactions-empty">
              <Text style={styles.muted}>No transactions yet</Text>
            </View>
          ) : (
            <View
              style={styles.txList}
              testID="wallet-transactions-preview"
            >
              {recent.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  muted: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  errorTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  balance: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  pendingText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionFilled: { backgroundColor: '#fff' },
  actionFilledText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  actionOutline: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  actionOutlineText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statRow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: spacing.lg,
  },
  body: { paddingHorizontal: 20, paddingTop: spacing.lg },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  topupRow: { gap: spacing.sm, paddingVertical: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  seeAll: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  txList: { gap: spacing.xs, paddingBottom: spacing.xl },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
