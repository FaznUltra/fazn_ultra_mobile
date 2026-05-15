import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FriendUser, FriendshipStatus } from '../../types/friends';
import { FriendAvatar } from './FriendAvatar';
import { colors, spacing, radius } from '../../theme';

function AddIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.textMuted} strokeWidth={2} />
      <Path d="M12 7V12L15 15" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={colors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface ActionButtonProps {
  status: FriendshipStatus;
  onAdd: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ActionButton({ status, onAdd, onCancel, loading }: ActionButtonProps) {
  if (loading) {
    return (
      <View style={styles.actionBtnBase}>
        <ActivityIndicator size="small" color={colors.primaryLight} />
      </View>
    );
  }

  if (status === 'friends') {
    return (
      <View style={[styles.actionBtnBase, styles.friendsBtn]}>
        <CheckIcon />
        <Text style={styles.friendsBtnText}>Friends</Text>
      </View>
    );
  }

  if (status === 'pending_sent') {
    return (
      <TouchableOpacity
        style={[styles.actionBtnBase, styles.pendingBtn]}
        onPress={onCancel}
        accessibilityRole="button"
        testID="search-cancel-btn"
      >
        <ClockIcon />
        <Text style={styles.pendingBtnText}>Pending</Text>
      </TouchableOpacity>
    );
  }

  if (status === 'pending_received') {
    return (
      <TouchableOpacity
        style={[styles.actionBtnBase, styles.addBtn]}
        onPress={onAdd}
        accessibilityRole="button"
        testID="search-accept-btn"
      >
        <CheckIcon />
        <Text style={styles.addBtnText}>Accept</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.actionBtnBase, styles.addBtn]}
      onPress={onAdd}
      accessibilityRole="button"
      testID="search-add-btn"
    >
      <AddIcon />
      <Text style={styles.addBtnText}>Add</Text>
    </TouchableOpacity>
  );
}

interface Props {
  user: FriendUser;
  onSendRequest: (id: string) => void;
  onCancelRequest: (id: string) => void;
  testID?: string;
}

export function SearchUserCard({ user, onSendRequest, onCancelRequest, testID }: Props) {
  const mutualText =
    user.mutualFriendsCount && user.mutualFriendsCount > 0
      ? `${user.mutualFriendsCount} mutual friend${user.mutualFriendsCount > 1 ? 's' : ''}`
      : null;

  return (
    <View style={styles.card} testID={testID}>
      <FriendAvatar user={user} size={46} />

      <View style={styles.info}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.username}>@{user.username}</Text>
        {mutualText && <Text style={styles.mutual}>{mutualText}</Text>}
      </View>

      <ActionButton
        status={user.friendshipStatus}
        onAdd={() => onSendRequest(user.id)}
        onCancel={() => onCancelRequest(user.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 20,
    gap: spacing.sm,
  },
  info: { flex: 1 },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 1,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  mutual: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actionBtnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  pendingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pendingBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  friendsBtn: {
    backgroundColor: colors.success + '22',
    borderWidth: 1,
    borderColor: colors.success + '55',
  },
  friendsBtnText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
});
