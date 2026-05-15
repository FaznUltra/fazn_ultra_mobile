import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../../navigation/types';
import { KeyboardAvoid } from '../../components/ui/KeyboardAvoid';
import { AuthCard } from '../../components/AuthCard';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { authApi, ApiError } from '../../lib/api';
import { setPendingAuth } from '../../lib/pendingTokens';
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

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    const next: FieldErrors = {
      firstName: validateRequired(firstName, 'First name') ?? undefined,
      lastName: validateRequired(lastName, 'Last name') ?? undefined,
      email: validateEmail(email) ?? undefined,
      username: validateUsername(username) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        validateConfirmPassword(password, confirmPassword) ?? undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      const res = await authApi.register({
        email: email.trim(),
        username: username.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      // Tokens are held in memory but NOT saved until the email is verified.
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
      } else if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Unable to create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    firstName,
    lastName,
    email,
    username,
    password,
    confirmPassword,
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoid contentContainerStyle={styles.content}>
        <AuthCard
          title="Create account"
          subtitle="Join FAZN to start capturing your gameplay"
        >
          <ErrorBanner message={formError} testID="register-error" />

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

          <Button
            title="Create account"
            onPress={handleSubmit}
            loading={loading}
            testID="register-submit"
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
        </AuthCard>
      </KeyboardAvoid>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, justifyContent: 'center' },
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  muted: { color: colors.textSecondary, fontSize: 14 },
});
