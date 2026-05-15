import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { Button } from '../../components/ui/Button';
import { SocialButton } from '../../components/ui/SocialButton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { startOAuth } from '../../lib/oauth';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing } from '../../theme';

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const login = useAuthStore((s) => s.login);
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = useCallback(
    async (provider: 'google' | 'apple') => {
      setError(null);
      setBusy(provider);
      try {
        const result = await startOAuth(provider);
        if (result) {
          await login(result.user, result.accessToken, result.refreshToken);
        }
      } catch {
        setError('Could not sign in with that provider. Please try again.');
      } finally {
        setBusy(null);
      }
    },
    [login],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.logo}>FAZN</Text>
          <Text style={styles.tagline}>Capture. Replay. Improve.</Text>
        </View>

        <View style={styles.actions}>
          <ErrorBanner message={error} testID="welcome-error" />

          <SocialButton
            provider="google"
            onPress={() => handleOAuth('google')}
            loading={busy === 'google'}
            disabled={busy !== null}
            testID="welcome-google"
          />
          <View style={styles.gap} />
          <SocialButton
            provider="apple"
            onPress={() => handleOAuth('apple')}
            loading={busy === 'apple'}
            disabled={busy !== null}
            testID="welcome-apple"
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <Button
            title="Sign in"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            disabled={busy !== null}
            testID="welcome-signin"
          />
          <View style={styles.gap} />
          <Button
            title="Create account"
            variant="primary"
            onPress={() => navigation.navigate('Register')}
            disabled={busy !== null}
            testID="welcome-create"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    color: colors.primaryLight,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 4,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  actions: { paddingBottom: spacing.md },
  gap: { height: spacing.md },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
});
