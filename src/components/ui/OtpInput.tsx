import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { colors, radius } from '../../theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  testID?: string;
}

/**
 * Six individual OTP boxes with auto-advance, backspace-to-previous and
 * paste-to-fill support.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  testID,
}: OtpInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits = value.split('').slice(0, length);

  const setCharAt = (index: number, char: string) => {
    const next = value.split('');
    next[index] = char;
    return next.join('').slice(0, length);
  };

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) {
      onChange(value.slice(0, index));
      return;
    }
    // Paste-to-fill: more than one char arrives at once.
    if (cleaned.length > 1) {
      const filled = (value.slice(0, index) + cleaned).slice(0, length);
      onChange(filled);
      const focusAt = Math.min(filled.length, length - 1);
      inputs.current[focusAt]?.focus();
      return;
    }
    const updated = setCharAt(index, cleaned);
    onChange(updated);
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      onChange(value.slice(0, index - 1));
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row} testID={testID}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          testID={`${testID ?? 'otp'}-box-${index}`}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={digits[index] ?? ''}
          onChangeText={(t) => handleChange(t, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={length}
          accessibilityLabel={`Digit ${index + 1}`}
          style={[
            styles.box,
            focusedIndex === index && styles.focused,
            error && styles.error,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  focused: { borderColor: colors.primary },
  error: { borderColor: colors.error },
});
