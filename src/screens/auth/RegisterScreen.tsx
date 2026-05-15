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
import { ProgressBar } from '../../components/ui/ProgressBar';
import { authApi, ApiError } from '../../lib/api';
import { setPendingAuth } from '../../lib/pendingTokens';
import { startOAuth } from '../../lib/oauth';
import { useAuthStore } from '../../store/auth.store';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validateUsername,
} from '../../lib/validation';
import { colors, spacing } from '../../theme';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const TOTAL_STEPS = 3;

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);

  const validateAll = useCallback((): FieldErrors => {
    return {
      firstName: validateRequired(firstName, 'First name') ?? undefined,
      lastName: validateRequired(lastName, 'Last name') ?? undefined,
      email: validateEmail(email) ?? undefined,
      username: validateUsername(username) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        validateConfirmPassword(password, confirmPassword) ?? undefined,
    };
  }, [firstName, lastName, email, username, password, confirmPassword]);

  const stepFields: Record<number, (keyof FieldErrors)[]> = {
    1: ['firstName', 'lastName'],
    2: ['email', 'username'],
    3: ['password', 'confirmPassword'],
  };

  const firstInvalidStep = (errs: FieldErrors): number => {
    for (let s = 1; s <= TOTAL_STEPS; s += 1) {
      if (stepFields[s].some((f) => errs[f])) return s;
    }
    return TOTAL_STEPS;
  };

  const goBack = useCallback(() => {
    setFormError(null);
    if (step > 1) {
      setStep((s) => s - 1);
      return;
    }
    if (navigation.canGoBack?.()) navigation.goBack();
    else navigation.navigate('Welcome');
  }, [step, navigation]);

  const register = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.register({
        email: email.trim(),
        username: username.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setPendingAuth({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      await authApi.sendVerification(res.user.email);
      navigation.navigate('VerifyEmail', { email: res.user.email });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'USER_EXISTS') {
        setFormError('An account with that email already exists.');
        setStep(2);
      } else if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Unable to create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, username, password, navigation]);

  const handlePrimary = useCallback(async () => {
    setFormError(null);
    const all = validateAll();

    // If the entire form is already valid, register straight away
    // regardless of which step is showing.
    if (!Object.values(all).some(Boolean)) {
      setErrors({});
      await register();
      return;
    }

    if (step < TOTAL_STEPS) {
      // Validate only the current step before advancing.
      const fieldsForStep = stepFields[step];
      const stepErrors: FieldErrors = {};
      let hasError = false;
      for (const f of fieldsForStep) {
        if (all[f]) {
          stepErrors[f] = all[f];
          hasError = true;
        }
      }
      setErrors(stepErrors);
      if (hasError) return;
      setStep((s) => s + 1);
      return;
    }

    // Final step with remaining errors: surface them and jump back.
    setErrors(all);
    setStep(firstInvalidStep(all));
  }, [step, validateAll, register]);

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

  const titles: Record<number, { title: string; subtitle: string }> = {
    1: { title: "Let's get started", subtitle: "What's your name?" },
    2: {
      title: 'Create your account',
      subtitle: 'Choose your email and username',
    },
    3: { title: 'Almost there', subtitle: 'Set a strong password' },
  };

  const primaryLabel = step < TOTAL_STEPS ? 'Continue' : 'Create account';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoid contentContainerStyle={styles.content}>
        <BackButton onPress={goBack} testID="register-back" />

        <ProgressBar
          steps={TOTAL_STEPS}
          current={step}
          testID="register-progress"
        />

        <View style={styles.header}>
          <Text style={styles.title}>{titles[step].title}</Text>
          <Text style={styles.subtitle}>{titles[step].subtitle}</Text>
        </View>

        <ErrorBanner message={formError} testID="register-error" />

        {/* Step 1 */}
        <View style={step === 1 ? undefined : styles.hidden}>
          <FormField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            error={errors.firstName}
            placeholder="Jane"
            testID="register-firstName"
          />
          <FormField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            error={errors.lastName}
            placeholder="Doe"
            testID="register-lastName"
          />
        </View>

        {/* Step 2 */}
        <View style={step === 2 ? undefined : styles.hidden}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            testID="register-email"
          />
          <FormField
            label="Username"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            autoCapitalize="none"
            placeholder="janedoe"
            testID="register-username"
          />
          <Text style={styles.hint}>
            3-32 characters: letters, numbers or underscores
          </Text>
        </View>

        {/* Step 3 */}
        <View style={step === 3 ? undefined : styles.hidden}>
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="At least 8 characters"
            testID="register-password"
          />
          <FormField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            placeholder="Re-enter your password"
            testID="register-confirmPassword"
          />
        </View>

        <Button
          title={primaryLabel}
          onPress={handlePrimary}
          loading={loading}
          disabled={busy !== null}
          testID="register-submit"
        />

        <Divider />

        <SocialButton
          provider="google"
          onPress={() => handleOAuth('google')}
          loading={busy === 'google'}
          disabled={loading || busy !== null}
          testID="register-google"
        />
        <View style={styles.gap} />
        <SocialButton
          provider="apple"
          onPress={() => handleOAuth('apple')}
          loading={busy === 'apple'}
          disabled={loading || busy !== null}
          testID="register-apple"
        />

        <View style={styles.footer}>
          <Text style={styles.muted}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
          >
            <Text style={styles.link}>Sign in</Text>
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
  header: { marginTop: spacing.lg, marginBottom: spacing.lg },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: { color: colors.textSecondary, fontSize: 15 },
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  gap: { height: spacing.md },
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  muted: { color: colors.textSecondary, fontSize: 14 },
});
