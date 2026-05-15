import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { KeyboardAvoid } from '../../components/ui/KeyboardAvoid';
import { AuthCard } from '../../components/AuthCard';
import { OtpInput } from '../../components/ui/OtpInput';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { authApi, ApiError } from '../../lib/api';
import {
  validateOtp,
  validatePassword,
  validateConfirmPassword,
} from '../../lib/validation';
import { colors, spacing } from '../../theme';

export function ResetPasswordScreen({
  route,
  navigation,
}: AuthScreenProps<'ResetPassword'>) {
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    const next = {
      otp: validateOtp(otp) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        validateConfirmPassword(password, confirmPassword) ?? undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await authApi.resetPassword(email, otp, password);
      Alert.alert(
        'Password reset',
        'Your password has been updated. Please sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (e) {
      if (e instanceof ApiError && e.code === 'INVALID_OTP') {
        setFormError('That code is incorrect or has expired.');
      } else if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Could not reset your password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [otp, password, confirmPassword, email, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoid contentContainerStyle={styles.content}>
        <AuthCard
          title="Reset password"
          subtitle={`Enter the code sent to ${email} and choose a new password`}
        >
          <ErrorBanner message={formError} testID="reset-error" />

          <Text style={styles.label}>Verification code</Text>
          <OtpInput
            value={otp}
            onChange={setOtp}
            error={!!errors.otp}
            testID="reset-otp"
          />
          {errors.otp ? (
            <Text style={styles.fieldError}>{errors.otp}</Text>
          ) : null}

          <View style={styles.spacer} />

          <FormField
            label="New password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="At least 8 characters"
            testID="reset-password"
          />
          <FormField
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            placeholder="Re-enter your password"
            testID="reset-confirmPassword"
          />

          <Button
            title="Reset password"
            onPress={handleSubmit}
            loading={loading}
            testID="reset-submit"
          />
        </AuthCard>
      </KeyboardAvoid>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, justifyContent: 'center' },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  fieldError: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
  spacer: { height: spacing.lg },
});
