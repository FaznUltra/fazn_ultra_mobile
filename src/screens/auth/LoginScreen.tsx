import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { KeyboardAvoid } from '../../components/ui/KeyboardAvoid';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { SocialButton } from '../../components/ui/SocialButton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { BackButton } from '../../components/ui/BackButton';
import { Divider } from '../../components/ui/Divider';
import { authApi, ApiError } from '../../lib/api';
import { startOAuth } from '../../lib/oauth';
import { useAuthStore } from '../../store/auth.store';
import { validateEmail, validatePassword } from '../../lib/validation';
import { colors, spacing } from '../../theme';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);

  const goBack = useCallback(() => {
    if (navigation.canGoBack?.()) navigation.goBack();
    else navigation.navigate('Welcome');
  }, [navigation]);

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      await login(res.user, res.accessToken, res.refreshToken);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'INVALID_CREDENTIALS') {
        setFormError('Incorrect email or password.');
      } else if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  const handleOAuth = useCallback(
    async (provider: 'google' | 'apple') => {
      setFormError(null);
      setBusy(provider);
      try {
        const result = await startOAuth(provider);
        if (result) {
          await login(result.user, result.accessToken, result.refreshToken);
        }
      } catch {
        setFormError(
          'Could not sign in with that provider. Please try again.',
        );
      } finally {
        setBusy(null);
      }
    },
    [login],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoid contentContainerStyle={styles.content}>
        <BackButton onPress={goBack} testID="login-back" />

        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your FAZN account</Text>
        </View>

        <ErrorBanner message={formError} testID="login-error" />

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
          testID="login-email"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          placeholder="••••••••"
          testID="login-password"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgot}
          accessibilityRole="button"
        >
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign in"
          onPress={handleSubmit}
          loading={loading}
          disabled={busy !== null}
          testID="login-submit"
        />

        <Divider />

        <SocialButton
          provider="google"
          onPress={() => handleOAuth('google')}
          loading={busy === 'google'}
          disabled={loading || busy !== null}
          testID="login-google"
        />
        <View style={styles.gap} />
        <SocialButton
          provider="apple"
          onPress={() => handleOAuth('apple')}
          loading={busy === 'apple'}
          disabled={loading || busy !== null}
          testID="login-apple"
        />

        <View style={styles.footer}>
          <Text style={styles.muted}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="button"
          >
            <Text style={styles.link}>Create one</Text>
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
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  gap: { height: spacing.md },
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  muted: { color: colors.textSecondary, fontSize: 14 },
});
