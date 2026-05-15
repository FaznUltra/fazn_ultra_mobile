import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { Button } from '../../components/ui/Button';
import { SocialButton } from '../../components/ui/SocialButton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Divider } from '../../components/ui/Divider';
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
      <View style={styles.content}>
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

          <Divider />

          <Button
            title="Sign in with email"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            disabled={busy !== null}
            testID="welcome-signin"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={busy !== null}
            accessibilityRole="button"
            style={styles.createWrap}
          >
            <Text style={styles.createText}>
              New to FAZN? <Text style={styles.createLink}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: spacing.xl,
  },
  brand: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  actions: { flex: 6, justifyContent: 'flex-end', paddingBottom: spacing.md },
  gap: { height: spacing.md },
  createWrap: { alignSelf: 'center', marginTop: spacing.md, padding: spacing.sm },
  createText: { color: colors.textSecondary, fontSize: 14 },
  createLink: { color: colors.primaryLight, fontWeight: '600' },
});
