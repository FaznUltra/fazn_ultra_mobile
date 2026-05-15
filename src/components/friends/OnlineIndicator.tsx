import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { OnlineStatus } from '../../types/friends';
import { colors } from '../../theme';

const STATUS_COLOR: Record<OnlineStatus, string> = {
  online: colors.success,
  in_game: colors.primaryLight,
  offline: '#4b5563',
};

interface Props {
  status: OnlineStatus;
  size?: number;
  testID?: string;
}

export function OnlineIndicator({ status, size = 12, testID }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'in_game') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulse.setValue(1);
    }
  }, [status, pulse]);

  const color = STATUS_COLOR[status];

  return (
    <View
      style={[
        styles.ring,
        {
          width: size + 4,
          height: size + 4,
          borderRadius: (size + 4) / 2,
        },
      ]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: pulse,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
});
