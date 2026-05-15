import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

/** Thin horizontal rule with a centered "or" label. */
export function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.text}>or</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  text: {
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
});
