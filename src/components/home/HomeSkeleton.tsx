import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, radius } from '../../theme';

const STREAM_HEIGHT = Dimensions.get('window').height * 0.65;

export function HomeSkeleton() {
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
    <View style={styles.container} testID="home-skeleton">
      {/* Shortcuts */}
      <View style={styles.shortcutsRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.shortcutItem}>
            <Bone style={styles.circle} />
            <Bone style={styles.shortcutLabel} />
          </View>
        ))}
      </View>

      {/* Featured */}
      <Bone style={styles.sectionHeader} />
      <Bone style={styles.featuredCard} />
      <Bone style={styles.featuredCard} />

      {/* Hot */}
      <Bone style={styles.sectionHeader} />
      <View style={styles.hotRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} style={styles.hotCard} />
        ))}
      </View>

      {/* Streams */}
      <Bone style={styles.sectionHeader} />
      <Bone style={styles.streamCard} />
      <Bone style={styles.streamCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: spacing.lg },
  bone: { backgroundColor: colors.surface, borderRadius: radius.sm },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  shortcutItem: { alignItems: 'center', gap: 6 },
  circle: { width: 52, height: 52, borderRadius: 26 },
  shortcutLabel: { width: 40, height: 8 },
  sectionHeader: {
    width: 160,
    height: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  featuredCard: {
    width: '100%',
    height: 190,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  hotRow: { flexDirection: 'row', gap: spacing.sm },
  hotCard: { width: 170, height: 155, borderRadius: radius.md },
  streamCard: {
    width: '100%',
    height: STREAM_HEIGHT,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
});
