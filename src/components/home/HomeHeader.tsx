import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, spacing } from '../../theme';

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21C13.28 21.89 12.66 22 12 22C11.34 22 10.72 21.89 10.27 21" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function WalletIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={16} rx={2} stroke={colors.success} strokeWidth={2} />
      <Path d="M2 10H22" stroke={colors.success} strokeWidth={2} />
      <Circle cx={17} cy={15} r={1.5} fill={colors.success} />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={colors.textMuted} strokeWidth={2} />
      <Path d="M20 20L16.65 16.65" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

interface Props {
  walletBalance: number | null;
  walletCurrency: string;
  notificationCount: number;
  onSearchPress: () => void;
  onNotificationPress: () => void;
  onWalletPress: () => void;
  testID?: string;
}

export function HomeHeader({
  walletBalance,
  walletCurrency,
  notificationCount,
  onSearchPress,
  onNotificationPress,
  onWalletPress,
  testID,
}: Props) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Brand */}
      <Text style={styles.brand}>FAZN</Text>

      {/* Right actions */}
      <View style={styles.actions}>
        {/* Wallet balance */}
        {walletBalance !== null && (
          <TouchableOpacity
            style={styles.walletChip}
            onPress={onWalletPress}
            accessibilityRole="button"
            accessibilityLabel="Wallet balance"
            testID="home-wallet-btn"
          >
            <WalletIcon />
            <Text style={styles.walletText} testID="home-wallet-balance">
              {walletCurrency}{walletBalance.toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}

        {/* Notification bell */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          testID="home-notification-btn"
        >
          <BellIcon />
          {notificationCount > 0 && (
            <View style={styles.badge} testID="home-notification-badge">
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tappable search bar — lives below the header, navigates to SearchScreen
export function SearchBarTap({ onPress, testID }: { onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity
      style={styles.searchBar}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="search"
      accessibilityLabel="Search players, challenges, games..."
      testID={testID ?? 'home-search-tap'}
    >
      <SearchIcon />
      <Text style={styles.searchPlaceholder}>Search players, challenges, games...</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
  },
  brand: {
    color: colors.primaryLight,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.success + '18',
    borderWidth: 1,
    borderColor: colors.success + '44',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  walletText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: 20,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
});
