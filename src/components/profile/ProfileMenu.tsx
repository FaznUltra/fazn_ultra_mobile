import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, spacing, radius } from '../../theme';

function WalletIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={16} rx={2} stroke={colors.primaryLight} strokeWidth={2} />
      <Path d="M2 10H22" stroke={colors.primaryLight} strokeWidth={2} />
      <Circle cx={17} cy={15} r={1.5} fill={colors.primaryLight} />
    </Svg>
  );
}

function PrivacyIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 6V12C4 16.42 7.58 20.54 12 22C16.42 20.54 20 16.42 20 12V6L12 2Z"
        stroke={colors.primaryLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 12L11 14L15 10" stroke={colors.primaryLight} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StreamingIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 9C7.5 6.5 11 5 12 5C13 5 16.5 6.5 19 9"
        stroke={colors.primaryLight}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 13C9.5 11.5 11 11 12 11C13 11 14.5 11.5 16 13"
        stroke={colors.primaryLight}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={18} r={2} fill={colors.primaryLight} />
    </Svg>
  );
}

function SettingsIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
        stroke={colors.primaryLight}
        strokeWidth={2}
      />
      <Path
        d="M19.4 15C19.2 15.5 19.4 16.1 19.8 16.5L19.9 16.6C20.6 17.3 20.6 18.4 19.9 19.1L19.1 19.9C18.4 20.6 17.3 20.6 16.6 19.9L16.5 19.8C16.1 19.4 15.5 19.2 15 19.4C14.5 19.6 14.2 20.1 14.2 20.6V20.8C14.2 21.8 13.4 22.5 12.5 22.5H11.5C10.6 22.5 9.8 21.8 9.8 20.8V20.6C9.8 20.1 9.5 19.6 9 19.4C8.5 19.2 7.9 19.4 7.5 19.8L7.4 19.9C6.7 20.6 5.6 20.6 4.9 19.9L4.1 19.1C3.4 18.4 3.4 17.3 4.1 16.6L4.2 16.5C4.6 16.1 4.8 15.5 4.6 15C4.4 14.5 3.9 14.2 3.4 14.2H3.2C2.2 14.2 1.5 13.4 1.5 12.5V11.5C1.5 10.6 2.2 9.8 3.2 9.8H3.4C3.9 9.8 4.4 9.5 4.6 9C4.8 8.5 4.6 7.9 4.2 7.5L4.1 7.4C3.4 6.7 3.4 5.6 4.1 4.9L4.9 4.1C5.6 3.4 6.7 3.4 7.4 4.1L7.5 4.2C7.9 4.6 8.5 4.8 9 4.6C9.5 4.4 9.8 3.9 9.8 3.4V3.2C9.8 2.2 10.6 1.5 11.5 1.5H12.5C13.4 1.5 14.2 2.2 14.2 3.2V3.4C14.2 3.9 14.5 4.4 15 4.6C15.5 4.8 16.1 4.6 16.5 4.2L16.6 4.1C17.3 3.4 18.4 3.4 19.1 4.1L19.9 4.9C20.6 5.6 20.6 6.7 19.9 7.4L19.8 7.5C19.4 7.9 19.2 8.5 19.4 9C19.6 9.5 20.1 9.8 20.6 9.8H20.8C21.8 9.8 22.5 10.6 22.5 11.5V12.5C22.5 13.4 21.8 14.2 20.8 14.2H20.6C20.1 14.2 19.6 14.5 19.4 15Z"
        stroke={colors.primaryLight}
        strokeWidth={2}
      />
    </Svg>
  );
}

function FplIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        stroke="#f59e0b"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H9"
        stroke={colors.error}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17L21 12L16 7M21 12H9"
        stroke={colors.error}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRight({ color = colors.textMuted }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  testID?: string;
}

function MenuItem({ icon, label, onPress, danger = false, testID }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      testID={testID}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.itemLabel, danger && styles.dangerLabel]}>{label}</Text>
      <ChevronRight color={danger ? colors.error : colors.textMuted} />
    </TouchableOpacity>
  );
}

interface Props {
  onLogout: () => void;
  onWalletPress: () => void;
  onEditPress?: () => void;
  onPrivacyPress: () => void;
  onStreamingPress: () => void;
  onSettingsPress: () => void;
  testID?: string;
}

const soon = (label: string) =>
  Alert.alert(label, 'This feature is coming soon.');

export function ProfileMenu({
  onLogout,
  onWalletPress,
  onPrivacyPress,
  onStreamingPress,
  onSettingsPress,
  testID,
}: Props) {
  return (
    <View testID={testID}>
      {/* Account section */}
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.group}>
        <MenuItem
          icon={<WalletIcon />}
          label="Wallet"
          onPress={onWalletPress}
          testID="menu-wallet"
        />
        <View style={styles.sep} />
        <MenuItem
          icon={<FplIcon />}
          label="FPL Fazn"
          onPress={() => soon('FPL Fazn')}
          testID="menu-fpl"
        />
      </View>

      {/* Preferences section */}
      <Text style={styles.sectionLabel}>Preferences</Text>
      <View style={styles.group}>
        <MenuItem
          icon={<PrivacyIcon />}
          label="Privacy"
          onPress={onPrivacyPress}
          testID="menu-privacy"
        />
        <View style={styles.sep} />
        <MenuItem
          icon={<StreamingIcon />}
          label="Streaming Channels"
          onPress={onStreamingPress}
          testID="menu-streaming"
        />
        <View style={styles.sep} />
        <MenuItem
          icon={<SettingsIcon />}
          label="Settings"
          onPress={onSettingsPress}
          testID="menu-settings"
        />
      </View>

      {/* Danger zone */}
      <View style={[styles.group, styles.dangerGroup]}>
        <MenuItem
          icon={<LogoutIcon />}
          label="Sign out"
          onPress={onLogout}
          danger
          testID="menu-logout"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dangerGroup: {
    borderColor: colors.error + '33',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  item: {
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
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  itemLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  dangerLabel: {
    color: colors.error,
  },
});
