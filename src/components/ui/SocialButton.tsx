import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing } from '../../theme';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill="#ffffff"
        d="M16.36 1.43c0 1.13-.42 2.18-1.25 3.13-.99 1.13-2.18 1.79-3.47 1.68a3.5 3.5 0 0 1-.03-.42c0-1.08.48-2.24 1.33-3.16.42-.47.96-.86 1.62-1.17.65-.3 1.27-.47 1.85-.5.01.15.02.3.02.44zM20.5 17.1c-.32.74-.7 1.42-1.16 2.05-.62.86-1.13 1.45-1.52 1.78-.6.55-1.25.84-1.94.86-.5 0-1.1-.14-1.8-.43-.7-.29-1.34-.43-1.93-.43-.62 0-1.28.14-1.99.43-.71.29-1.28.44-1.72.46-.66.03-1.32-.27-1.98-.89-.42-.36-.95-.97-1.59-1.83-.69-.92-1.25-1.98-1.69-3.19C2.65 14.43 2.4 13.15 2.4 11.9c0-1.43.31-2.66.93-3.69a5.44 5.44 0 0 1 1.95-1.96 5.25 5.25 0 0 1 2.64-.74c.53 0 1.22.16 2.09.48.86.32 1.42.48 1.66.48.18 0 .8-.19 1.85-.57 1-.35 1.84-.5 2.53-.44 1.87.15 3.27.89 4.21 2.22-1.67 1.01-2.5 2.43-2.48 4.25.02 1.42.53 2.6 1.54 3.53.46.43.97.77 1.54 1.01-.12.36-.25.7-.4 1.04z"
      />
    </Svg>
  );
}

export function SocialButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
  testID,
}: SocialButtonProps) {
  const isDisabled = disabled || loading;
  const label = provider === 'google' ? 'Continue with Google' : 'Continue with Apple';

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[styles.button, isDisabled && styles.disabled]}
    >
      <View style={styles.icon}>
        {provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
      </View>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.lg,
  },
  disabled: { opacity: 0.5 },
  icon: { marginRight: spacing.sm },
  text: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
});
