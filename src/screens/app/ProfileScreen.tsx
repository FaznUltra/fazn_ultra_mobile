import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { StatsRow } from '../../components/profile/StatsRow';
import { GameRankingsCard } from '../../components/profile/GameRankingsCard';
import { HighlightsRow } from '../../components/profile/HighlightsRow';
import { RecentResults } from '../../components/profile/RecentResults';
import { ProfileMenu } from '../../components/profile/ProfileMenu';
import { ProfileSkeleton } from '../../components/profile/ProfileSkeleton';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing } from '../../theme';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { state, retry } = useProfile();
  const navigation = useNavigation();

  const goToWallet = () =>
    navigation.dispatch(
      CommonActions.navigate({ name: 'Home', params: { screen: 'WalletMain' } }),
    );

  if (!user) return null;

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <ScreenContainer testID="profile-screen">
        <ProfileSkeleton />
      </ScreenContainer>
    );
  }

  if (state.status === 'error') {
    return (
      <ScreenContainer testID="profile-screen">
        <View style={styles.errorState} testID="profile-error">
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{state.message}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={retry}
            accessibilityRole="button"
            testID="profile-retry"
          >
            <Text style={styles.retryLabel}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const { data } = state;

  return (
    <ScreenContainer testID="profile-screen">
      <ProfileHeader
        user={user}
        globalRank={data.stats.globalRank}
        onEditPress={() => {}}
        testID="profile-header"
      />

      <StatsRow stats={data.stats} testID="profile-stats" />

      <SectionHeader title="Game Rankings" />
      <GameRankingsCard rankings={data.gameRankings} testID="profile-rankings" />

      <SectionHeader title="Highlights" />
      <HighlightsRow
        highestWin={data.highestWin}
        topRival={data.topRival}
        testID="profile-highlights"
      />

      <SectionHeader title="Last 5 Results" />
      <RecentResults results={data.recentResults} testID="profile-results" />

      <ProfileMenu onLogout={logout} onWalletPress={goToWallet} testID="profile-menu" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.sm,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 24,
  },
  retryLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
