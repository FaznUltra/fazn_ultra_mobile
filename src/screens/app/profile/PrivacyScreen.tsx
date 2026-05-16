import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../navigation/types';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Button } from '../../../components/ui/Button';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import {
  ChevronLeftIcon,
  EyeIcon,
  OnlineIcon,
  GamepadIcon,
  SwordIcon,
  HistoryIcon,
  BellIcon,
  PeopleIcon,
  TrophyIcon,
} from '../../../components/profile/ProfileIcons';
import { colors, spacing, radius } from '../../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Privacy'>;

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  toggleKey: string;
}

function ToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  toggleKey,
}: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        testID={`toggle-${toggleKey}`}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function PrivacyScreen({ navigation }: Props) {
  const [state, setState] = useState({
    publicProfile: true,
    onlineStatus: true,
    gameActivity: true,
    acceptChallenges: true,
    matchHistory: false,
    challengeInvites: true,
    friendRequests: true,
    resultAnnouncements: false,
  });

  const set = (key: keyof typeof state) => (v: boolean) =>
    setState((prev) => ({ ...prev, [key]: v }));

  return (
    <ScreenContainer testID="privacy-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          testID="privacy-back-btn"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <SectionHeader title="Visibility" />
      <View style={styles.group}>
        <ToggleRow
          icon={<EyeIcon />}
          label="Public Profile"
          subtitle="Anyone can view your profile"
          value={state.publicProfile}
          onValueChange={set('publicProfile')}
          toggleKey="public-profile"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<OnlineIcon />}
          label="Show Online Status"
          subtitle="Friends can see when you're online"
          value={state.onlineStatus}
          onValueChange={set('onlineStatus')}
          toggleKey="online-status"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<GamepadIcon />}
          label="Show Game Activity"
          subtitle="Show what games you're playing"
          value={state.gameActivity}
          onValueChange={set('gameActivity')}
          toggleKey="game-activity"
        />
      </View>

      <SectionHeader title="Challenges" />
      <View style={styles.group}>
        <ToggleRow
          icon={<SwordIcon />}
          label="Accept Challenge Requests"
          subtitle="Allow others to send you challenges"
          value={state.acceptChallenges}
          onValueChange={set('acceptChallenges')}
          toggleKey="accept-challenges"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<HistoryIcon />}
          label="Show Match History"
          subtitle="Display your recent results publicly"
          value={state.matchHistory}
          onValueChange={set('matchHistory')}
          toggleKey="match-history"
        />
      </View>

      <SectionHeader title="Notifications" />
      <View style={styles.group}>
        <ToggleRow
          icon={<SwordIcon />}
          label="Challenge Invites"
          subtitle="Get notified when someone challenges you"
          value={state.challengeInvites}
          onValueChange={set('challengeInvites')}
          toggleKey="challenge-invites"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<PeopleIcon />}
          label="Friend Requests"
          subtitle="Get notified of new friend requests"
          value={state.friendRequests}
          onValueChange={set('friendRequests')}
          toggleKey="friend-requests"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<TrophyIcon />}
          label="Result Announcements"
          subtitle="Notify friends when you win"
          value={state.resultAnnouncements}
          onValueChange={set('resultAnnouncements')}
          toggleKey="result-announcements"
        />
      </View>

      <View style={styles.saveWrap}>
        <Button
          title="Save"
          testID="privacy-save-btn"
          onPress={() =>
            Alert.alert('Saved', 'Privacy settings saved.')
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: { width: 24 },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  saveWrap: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
