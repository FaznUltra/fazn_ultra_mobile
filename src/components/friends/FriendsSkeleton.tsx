import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

function Bone({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, backgroundColor: colors.surface, borderRadius: radius.sm, opacity }, style]}
    />
  );
}

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Bone width={48} height={48} style={styles.circle} />
      <View style={styles.lines}>
        <Bone width={140} height={14} />
        <Bone width={90} height={11} style={styles.mt4} />
        <Bone width={70} height={10} style={styles.mt4} />
      </View>
      <Bone width={60} height={30} style={styles.pill} />
    </View>
  );
}

export function FriendsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View testID="friends-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 20,
    gap: spacing.sm,
  },
  circle: { borderRadius: 24, flexShrink: 0 },
  lines: { flex: 1, gap: 0 },
  pill: { borderRadius: 16 },
  mt4: { marginTop: 4 },
});
