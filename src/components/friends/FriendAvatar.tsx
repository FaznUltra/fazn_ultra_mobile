import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '../profile/Avatar';
import { OnlineIndicator } from './OnlineIndicator';
import type { FriendUser } from '../../types/friends';

interface Props {
  user: FriendUser;
  size?: number;
  testID?: string;
}

export function FriendAvatar({ user, size = 48, testID }: Props) {
  return (
    <View style={styles.wrap} testID={testID}>
      <Avatar
        avatarUrl={user.avatarUrl}
        firstName={user.firstName}
        lastName={user.lastName}
        size={size}
      />
      <View
        style={[
          styles.indicator,
          { bottom: -1, right: -1 },
        ]}
      >
        <OnlineIndicator status={user.onlineStatus} size={11} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  indicator: { position: 'absolute' },
});
