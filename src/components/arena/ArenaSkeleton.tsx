import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

export function ArenaSkeleton() {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const Bone = ({ style }: { style: object }) => (
    <Animated.View style={[styles.bone, style, { opacity: pulse }]} />
  );

  return (
    <View style={styles.container} testID="arena-skeleton">
      <Bone style={styles.tabs} />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Bone style={styles.swatch} />
            <Bone style={styles.title} />
            <Bone style={styles.badge} />
          </View>
          <Bone style={styles.line} />
          <Bone style={styles.lineShort} />
          <Bone style={styles.action} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: spacing.lg },
  bone: { backgroundColor: colors.surface, borderRadius: radius.sm },
  tabs: {
    width: '100%',
    height: 36,
    borderRadius: 18,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swatch: { width: 20, height: 20, borderRadius: 10 },
  title: { flex: 1, height: 14 },
  badge: { width: 64, height: 18, borderRadius: 9 },
  line: { width: '100%', height: 12 },
  lineShort: { width: '55%', height: 12 },
  action: { width: '100%', height: 36, borderRadius: radius.md },
});
