import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  error?: boolean;
  leftIcon?: React.ReactNode;
}

/**
 * Text input with a focus ring (border colour change), error state and a
 * built-in show/hide toggle when `secureTextEntry` is set.
 */
export function Input({
  error = false,
  leftIcon,
  secureTextEntry,
  editable = true,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View
      style={[
        styles.container,
        focused && styles.focused,
        error && styles.error,
        !editable && styles.disabled,
      ]}
    >
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
      <TextInput
        {...rest}
        editable={editable}
        secureTextEntry={hidden}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={styles.input}
      />
      {secureTextEntry ? (
        <TouchableOpacity
          onPress={() => setHidden((h) => !h)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.eye}
        >
          <Text style={styles.eyeText}>{hidden ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  focused: { borderColor: colors.primary },
  error: { borderColor: colors.error },
  disabled: { opacity: 0.5 },
  leftIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  eye: { paddingLeft: spacing.sm },
  eyeText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
