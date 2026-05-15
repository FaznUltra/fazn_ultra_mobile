import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { FriendRequest } from '../../types/friends';
import { FriendAvatar } from './FriendAvatar';
import { colors, spacing, radius } from '../../theme';

function CheckIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CrossIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Props {
  request: FriendRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  testID?: string;
}

export function FriendRequestCard({ request, onAccept, onReject, onCancel, testID }: Props) {
  const { user, direction, sentAt } = request;
  const mutualText =
    user.mutualFriendsCount && user.mutualFriendsCount > 0
      ? `${user.mutualFriendsCount} mutual`
      : null;

  return (
    <View style={styles.card} testID={testID}>
      <FriendAvatar user={user} size={48} />

      <View style={styles.info}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.meta}>
          {timeAgo(sentAt)}
          {mutualText ? ` · ${mutualText}` : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        {direction === 'incoming' ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => onAccept?.(request.id)}
              accessibilityRole="button"
              accessibilityLabel="Accept request"
              testID={`accept-btn-${request.id}`}
            >
              <CheckIcon />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => onReject?.(request.id)}
              accessibilityRole="button"
              accessibilityLabel="Reject request"
              testID={`reject-btn-${request.id}`}
            >
              <CrossIcon color={colors.error} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={() => onCancel?.(request.id)}
            accessibilityRole="button"
            accessibilityLabel="Cancel request"
            testID={`cancel-btn-${request.id}`}
          >
            <CrossIcon color={colors.textMuted} />
          </TouchableOpacity>
        )}
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
  meta: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.primary,
  },
  rejectBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error + '55',
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
