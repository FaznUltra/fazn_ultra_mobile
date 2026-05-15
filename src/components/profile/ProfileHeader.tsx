import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { User } from '../../lib/schemas';
import type { ProfileStats } from '../../types/profile';
import { Avatar } from './Avatar';
import { colors, spacing } from '../../theme';

function EditIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13"
        stroke={colors.primaryLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
        stroke={colors.primaryLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface Props {
  user: User;
  globalRank: number;
  onEditPress: () => void;
  testID?: string;
}

export function ProfileHeader({ user, globalRank, onEditPress, testID }: Props) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.avatarRow}>
        <Avatar
          avatarUrl={null}
          firstName={user.first_name}
          lastName={user.last_name}
          size={88}
          testID="profile-avatar"
        />
        <TouchableOpacity
          style={styles.editBtn}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          testID="profile-edit-btn"
        >
          <EditIcon />
          <Text style={styles.editLabel}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.name} testID="profile-name">
        {user.first_name} {user.last_name}
      </Text>
      <Text style={styles.username} testID="profile-username">
        @{user.username}
      </Text>

      <View style={styles.rankBadge} testID="profile-global-rank">
        <Text style={styles.rankLabel}>Global Rank</Text>
        <Text style={styles.rankValue}>#{globalRank.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  editLabel: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '22',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  rankLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  rankValue: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
