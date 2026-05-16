import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../navigation/types';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  BellIcon,
  GlobeIcon,
  MoonIcon,
  TrashIcon,
  HelpIcon,
  BugIcon,
  DocumentIcon,
  PrivacyDocIcon,
} from '../../../components/profile/ProfileIcons';
import { colors, spacing, radius } from '../../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

const soon = () => Alert.alert('Coming soon', 'This feature is coming soon.');

interface NavRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  value?: string;
  danger?: boolean;
  testID: string;
}

function NavRow({ icon, label, onPress, value, danger, testID }: NavRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      testID={testID}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.rowLabel, danger && styles.dangerLabel]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <ChevronRightIcon
        size={16}
        color={danger ? colors.error : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  toggleKey: string;
}

function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
  toggleKey,
}: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        testID={`toggle-${toggleKey}`}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);

  const onClearCache = () =>
    Alert.alert('Clear Cache', 'Remove all cached data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => {} },
    ]);

  const onDeleteAccount = () =>
    Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'This cannot be undone',
            'All your data will be permanently removed.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete Account', style: 'destructive', onPress: () => {} },
            ],
          ),
      },
    ]);

  return (
    <ScreenContainer testID="settings-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          testID="settings-back-btn"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <SectionHeader title="Account" />
      <View style={styles.group}>
        <NavRow
          icon={<LockIcon />}
          label="Change Password"
          onPress={soon}
          testID="settings-change-password"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<MailIcon />}
          label="Change Email"
          onPress={soon}
          testID="settings-change-email"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<PhoneIcon />}
          label="Phone Number"
          onPress={soon}
          testID="settings-phone"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<ShieldIcon />}
          label="Two-Factor Authentication"
          onPress={soon}
          testID="settings-2fa"
        />
      </View>

      <SectionHeader title="Notifications" />
      <View style={styles.group}>
        <ToggleRow
          icon={<BellIcon />}
          label="Push Notifications"
          value={push}
          onValueChange={setPush}
          toggleKey="push"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<MailIcon />}
          label="Email Notifications"
          value={email}
          onValueChange={setEmail}
          toggleKey="email"
        />
        <View style={styles.sep} />
        <ToggleRow
          icon={<PhoneIcon />}
          label="SMS Alerts"
          value={sms}
          onValueChange={setSms}
          toggleKey="sms"
        />
      </View>

      <SectionHeader title="App" />
      <View style={styles.group}>
        <NavRow
          icon={<GlobeIcon />}
          label="App Language"
          value="English"
          onPress={soon}
          testID="settings-language"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<MoonIcon />}
          label="App Theme"
          value="Dark"
          onPress={soon}
          testID="settings-theme"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<TrashIcon />}
          label="Clear Cache"
          onPress={onClearCache}
          testID="settings-clear-cache"
        />
      </View>

      <SectionHeader title="Support" />
      <View style={styles.group}>
        <NavRow
          icon={<HelpIcon />}
          label="Help & FAQ"
          onPress={soon}
          testID="settings-help"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<BugIcon />}
          label="Report a Bug"
          onPress={soon}
          testID="settings-bug"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<DocumentIcon />}
          label="Terms of Service"
          onPress={soon}
          testID="settings-terms"
        />
        <View style={styles.sep} />
        <NavRow
          icon={<PrivacyDocIcon />}
          label="Privacy Policy"
          onPress={soon}
          testID="settings-privacy-policy"
        />
      </View>

      <View style={[styles.group, styles.dangerGroup]}>
        <NavRow
          icon={<TrashIcon color={colors.error} />}
          label="Delete Account"
          onPress={onDeleteAccount}
          danger
          testID="settings-delete-account"
        />
      </View>

      <Text style={styles.version}>FAZN v1.0.0</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: { width: 24 },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dangerGroup: {
    borderColor: colors.error + '33',
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  dangerLabel: {
    color: colors.error,
  },
  rowValue: {
    color: colors.textMuted,
    fontSize: 14,
    marginRight: spacing.xs,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
