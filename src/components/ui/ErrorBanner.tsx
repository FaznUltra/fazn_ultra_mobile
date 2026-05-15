import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface ErrorBannerProps {
  message: string | null;
  testID?: string;
}

/** Inline toast-style error banner (no external toast lib). */
export function ErrorBanner({ message, testID }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <View
      style={styles.banner}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: { color: colors.error, fontSize: 14 },
});
