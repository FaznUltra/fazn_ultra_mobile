import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../navigation/types';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { colors, spacing, radius } from '../../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'StreamingChannels'>;

const AMBER_BG = '#3a2e0a';
const AMBER_TEXT = '#f59e0b';

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RecordIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.border} strokeWidth={2} />
      <Circle cx={12} cy={12} r={4} fill="#ff0000" />
    </Svg>
  );
}

function YouTubeIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={14} rx={4} fill="#ff0000" />
      <Path d="M10 9L15 12L10 15V9Z" fill="#ffffff" />
    </Svg>
  );
}

function TwitchIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={4} fill="#9146ff" />
      <Path
        d="M8 7H16V13L13 16H11L9 18V16H8V7Z"
        fill="#ffffff"
      />
    </Svg>
  );
}

interface ServiceRowProps {
  icon: React.ReactNode;
  label: string;
  account: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connectTestID: string;
  disconnectTestID: string;
  testID: string;
}

function ConnectedServiceRow({
  icon,
  label,
  account,
  onConnect,
  onDisconnect,
  connectTestID,
  disconnectTestID,
  testID,
}: ServiceRowProps) {
  return (
    <View style={styles.serviceRow} testID={testID}>
      <View style={styles.serviceIcon}>{icon}</View>
      <Text style={styles.serviceLabel}>{label}</Text>
      {account === null ? (
        <TouchableOpacity
          style={styles.connectBtn}
          onPress={onConnect}
          activeOpacity={0.7}
          accessibilityRole="button"
          testID={connectTestID}
        >
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.connectedWrap}>
          <Text style={styles.accountText}>@{account}</Text>
          <TouchableOpacity
            onPress={onDisconnect}
            activeOpacity={0.7}
            accessibilityRole="button"
            testID={disconnectTestID}
            hitSlop={8}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

interface StepProps {
  index: number;
  text: string;
}

function StepCard({ index, text }: StepProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{index}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

export function StreamingChannelsScreen({ navigation }: Props) {
  const [recorderEnabled, setRecorderEnabled] = useState(true);
  const [youtubeAccount, setYoutubeAccount] = useState<string | null>(null);
  const [twitchAccount, setTwitchAccount] = useState<string | null>(null);

  const connectYouTube = () =>
    Alert.alert(
      'Connect YouTube',
      'OAuth integration coming soon. Your stream link will be pulled automatically once connected.',
      [{ text: 'OK' }],
    );

  const connectTwitch = () =>
    Alert.alert(
      'Connect Twitch',
      'OAuth integration coming soon. Your stream link will be pulled automatically once connected.',
      [{ text: 'OK' }],
    );

  const disconnectYouTube = () =>
    Alert.alert('Disconnect YouTube', 'Stop pulling streams from this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => setYoutubeAccount(null),
      },
    ]);

  const disconnectTwitch = () =>
    Alert.alert('Disconnect Twitch', 'Stop pulling streams from this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => setTwitchAccount(null),
      },
    ]);

  return (
    <ScreenContainer testID="streaming-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          testID="streaming-back-btn"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.title}>Streaming Channels</Text>
        <View style={styles.headerSpacer} />
      </View>

      <SectionHeader title="Mobile" />
      <View style={styles.card}>
        <View style={styles.recorderRow}>
          <View style={styles.serviceIcon}>
            <RecordIcon />
          </View>
          <View style={styles.recorderTextWrap}>
            <Text style={styles.cardTitle}>FAZN Screen Recorder</Text>
            <Text style={styles.cardSubtitle}>
              Used automatically for all mobile challenges
            </Text>
          </View>
          <Switch
            testID="toggle-recorder"
            value={recorderEnabled}
            onValueChange={setRecorderEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        {!recorderEnabled ? (
          <View style={styles.warningChip} testID="recorder-warning">
            <Text style={styles.warningChipText}>
              Mobile challenges require the recorder to be enabled
            </Text>
          </View>
        ) : null}
      </View>

      <SectionHeader title="Console (PS4 / PS5 / Xbox)" />
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Console players must connect a streaming account. FAZN will
          automatically extract your stream link for challenge scoring and live
          display on the platform.
        </Text>
      </View>

      <View style={styles.card}>
        <ConnectedServiceRow
          icon={<YouTubeIcon />}
          label="YouTube"
          account={youtubeAccount}
          onConnect={connectYouTube}
          onDisconnect={disconnectYouTube}
          connectTestID="connect-youtube"
          disconnectTestID="disconnect-youtube"
          testID="youtube-row"
        />
        <View style={styles.sep} />
        <ConnectedServiceRow
          icon={<TwitchIcon />}
          label="Twitch"
          account={twitchAccount}
          onConnect={connectTwitch}
          onDisconnect={disconnectTwitch}
          connectTestID="connect-twitch"
          disconnectTestID="disconnect-twitch"
          testID="twitch-row"
        />
      </View>

      <SectionHeader title="How It Works" />
      <View style={styles.steps}>
        <StepCard
          index={1}
          text="Start your stream on YouTube or Twitch before the match begins."
        />
        <StepCard
          index={2}
          text="FAZN automatically detects your live stream and displays it on the challenge page."
        />
        <StepCard
          index={3}
          text="After the match, the recording is analysed by AI to determine the result."
        />
      </View>

      <Text style={styles.footer}>
        Stream recording and AI scoring — powered by FAZN
      </Text>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recorderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  recorderTextWrap: {
    flex: 1,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  warningChip: {
    backgroundColor: AMBER_BG,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  warningChipText: {
    color: AMBER_TEXT,
    fontSize: 13,
    fontWeight: '500',
  },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: AMBER_TEXT,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bannerText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  serviceLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  connectBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  connectBtnText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  connectedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  disconnectText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  steps: {
    gap: spacing.xs,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
