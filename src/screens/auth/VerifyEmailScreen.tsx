import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { KeyboardAvoid } from '../../components/ui/KeyboardAvoid';
import { OtpInput } from '../../components/ui/OtpInput';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { BackButton } from '../../components/ui/BackButton';
import { authApi, ApiError } from '../../lib/api';
import { consumePendingAuth } from '../../lib/pendingTokens';
import { useAuthStore } from '../../store/auth.store';
import { validateOtp } from '../../lib/validation';
import { colors, spacing } from '../../theme';

const RESEND_COOLDOWN = 60;

export function VerifyEmailScreen({
  route,
  navigation,
}: AuthScreenProps<'VerifyEmail'>) {
  const { email } = route.params;
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goBack = useCallback(() => {
    if (navigation.canGoBack?.()) navigation.goBack();
    else navigation.navigate('Welcome');
  }, [navigation]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleVerify = useCallback(async () => {
    setFormError(null);
    const err = validateOtp(otp);
    if (err) {
      setOtpError(err);
      return;
    }
    setOtpError(undefined);
    setLoading(true);
    try {
      await authApi.verifyEmail(email, otp);
      const pending = consumePendingAuth();
      if (pending) {
        await login(
          { ...pending.user, email_verified: true },
          pending.accessToken,
          pending.refreshToken,
        );
      } else {
        setFormError('Session expired. Please sign in.');
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'INVALID_OTP') {
        setFormError('That code is incorrect or has expired.');
      } else if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Could not verify your email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [otp, email, login]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    setFormError(null);
    try {
      await authApi.sendVerification(email);
      setCooldown(RESEND_COOLDOWN);
      timerRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1 && timerRef.current) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setFormError('Could not resend the code. Please try again.');
    }
  }, [cooldown, email]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoid contentContainerStyle={styles.content}>
        <BackButton onPress={goBack} testID="verify-back" />

        <View style={styles.header}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email}
          </Text>
        </View>

        <ErrorBanner message={formError} testID="verify-error" />

        <OtpInput
          value={otp}
          onChange={setOtp}
          error={!!otpError}
          testID="verify-otp"
        />
        {otpError ? <Text style={styles.fieldError}>{otpError}</Text> : null}

        <View style={styles.spacer} />
        <Button
          title="Verify email"
          onPress={handleVerify}
          loading={loading}
          testID="verify-submit"
        />

        <TouchableOpacity
          onPress={handleResend}
          disabled={cooldown > 0}
          style={styles.resend}
          accessibilityRole="button"
        >
          <Text style={cooldown > 0 ? styles.muted : styles.link}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoid>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: { color: colors.textSecondary, fontSize: 15 },
  spacer: { height: spacing.lg },
  fieldError: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
  resend: { alignSelf: 'center', marginTop: spacing.lg },
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  muted: { color: colors.textMuted, fontSize: 14 },
});
