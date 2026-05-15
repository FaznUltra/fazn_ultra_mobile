import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

interface ProgressBarProps {
  /** Total number of segments. */
  steps: number;
  /** 1-based index of the current step (segments <= current are filled). */
  current: number;
  testID?: string;
}

/** Thin segmented step indicator. */
export function ProgressBar({ steps, current, testID }: ProgressBarProps) {
  return (
    <View style={styles.row} testID={testID}>
      {Array.from({ length: steps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i === 0 && styles.first,
            i + 1 <= current ? styles.filled : styles.unfilled,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginLeft: spacing.sm,
  },
  first: { marginLeft: 0 },
  filled: { backgroundColor: colors.primary },
  unfilled: { backgroundColor: colors.border },
});
