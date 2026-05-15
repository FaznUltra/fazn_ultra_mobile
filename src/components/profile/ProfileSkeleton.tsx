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
      style={[
        { width, height, backgroundColor: colors.surface, borderRadius: radius.sm, opacity },
        style,
      ]}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.container} testID="profile-skeleton">
      {/* Header */}
      <View style={styles.headerSection}>
        <Bone width={94} height={94} style={styles.circle} />
        <Bone width={140} height={20} style={styles.mt12} />
        <Bone width={100} height={14} style={styles.mt8} />
        <Bone width={110} height={28} style={styles.mt12} />
      </View>

      {/* Stats row */}
      <Bone width="100%" height={72} style={styles.mt24} />

      {/* Section label */}
      <Bone width={110} height={12} style={styles.mt24} />

      {/* Rankings */}
      <Bone width="100%" height={54} style={styles.mt8} />
      <Bone width="100%" height={54} style={styles.mt4} />
      <Bone width="100%" height={54} style={styles.mt4} />

      {/* Section label */}
      <Bone width={90} height={12} style={styles.mt24} />

      {/* Highlights */}
      <View style={styles.row}>
        <Bone width="48%" height={120} />
        <Bone width="48%" height={120} />
      </View>

      {/* Section label */}
      <Bone width={100} height={12} style={styles.mt24} />

      {/* Results */}
      <Bone width="100%" height={52} style={styles.mt8} />
      <Bone width="100%" height={52} style={styles.mt4} />
      <Bone width="100%" height={52} style={styles.mt4} />
      <Bone width="100%" height={52} style={styles.mt4} />
      <Bone width="100%" height={52} style={styles.mt4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg },
  headerSection: { alignItems: 'center' },
  circle: { borderRadius: 47 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  mt4: { marginTop: 4 },
  mt8: { marginTop: spacing.sm },
  mt12: { marginTop: 12 },
  mt24: { marginTop: spacing.lg },
});
