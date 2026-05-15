import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FriendUser } from '../../types/friends';
import { FriendAvatar } from './FriendAvatar';
import { colors, spacing, radius } from '../../theme';

const STATUS_LABEL: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  in_game: 'In a game',
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'}>
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke={filled ? '#f59e0b' : colors.textMuted}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DotsIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={1.5} fill={colors.textMuted} />
      <Circle cx={12} cy={12} r={1.5} fill={colors.textMuted} />
      <Circle cx={12} cy={19} r={1.5} fill={colors.textMuted} />
    </Svg>
  );
}

interface Props {
  friend: FriendUser;
  onToggleFavourite: (id: string) => void;
  onUnfriend: (id: string) => void;
  testID?: string;
}

export function FriendCard({ friend, onToggleFavourite, onUnfriend, testID }: Props) {
  const statusColor =
    friend.onlineStatus === 'online'
      ? colors.success
      : friend.onlineStatus === 'in_game'
      ? colors.primaryLight
      : colors.textMuted;

  const statusText =
    friend.onlineStatus === 'in_game' && friend.currentGame
      ? `Playing ${friend.currentGame}`
      : STATUS_LABEL[friend.onlineStatus];

  const openActions = () => {
    Alert.alert(
      `@${friend.username}`,
      undefined,
      [
        {
          text: friend.isFavourite ? 'Remove from Favourites' : 'Add to Favourites',
          onPress: () => onToggleFavourite(friend.id),
        },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Unfriend',
              `Remove ${friend.firstName} from your friends?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Unfriend', style: 'destructive', onPress: () => onUnfriend(friend.id) },
              ],
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.card} testID={testID}>
      <FriendAvatar user={friend} size={48} testID={`friend-avatar-${friend.id}`} />

      <View style={styles.info}>
        <Text style={styles.name} testID={`friend-name-${friend.id}`}>
          {friend.firstName} {friend.lastName}
        </Text>
        <Text style={styles.username}>@{friend.username}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onToggleFavourite(friend.id)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={friend.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          testID={`friend-favourite-${friend.id}`}
        >
          <StarIcon filled={friend.isFavourite} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openActions}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="More actions"
          testID={`friend-menu-${friend.id}`}
        >
          <DotsIcon />
        </TouchableOpacity>
      </View>
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
  status: {
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
