import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface BackButtonProps {
  onPress: () => void;
  testID?: string;
}

/** Top-left back arrow with a 44x44 touch target. */
export function BackButton({ onPress, testID }: BackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.button}
    >
      <Text style={styles.arrow}>←</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  arrow: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
});
