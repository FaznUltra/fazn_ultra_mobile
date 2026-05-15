import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { KeyboardAvoid } from '../../components/ui/KeyboardAvoid';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { BackButton } from '../../components/ui/BackButton';
import { authApi, ApiError } from '../../lib/api';
import { validateEmail } from '../../lib/validation';
import { colors, spacing } from '../../theme';

export function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goBack = useCallback(() => {
    if (navigation.canGoBack?.()) navigation.goBack();
    else navigation.navigate('Login');
  }, [navigation]);

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(undefined);
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (e) {
      if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Could not send the reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoid contentContainerStyle={styles.content}>
        <BackButton onPress={goBack} testID="forgot-back" />

        <View style={styles.header}>
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset code
          </Text>
        </View>

        <ErrorBanner message={formError} testID="forgot-error" />

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
          testID="forgot-email"
        />

        <Button
          title="Send reset code"
          onPress={handleSubmit}
          loading={loading}
          testID="forgot-submit"
        />

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
          >
            <Text style={styles.link}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
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
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: spacing.lg },
});
