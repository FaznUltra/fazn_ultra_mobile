import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Button } from '../../../components/ui/Button';
import { colors, spacing } from '../../../theme';
import type { HomeStackParamList } from '../../../navigation/types';
import type {
  ChallengeSetupData,
  OpponentType,
} from '../../../types/challenge';
import {
  ReadonlyChip,
  StakeInput,
  DateRow,
  PlatformDatePicker,
  OpponentPicker,
  useDateState,
  MIN_STAKE,
  type MockFriend,
} from './setupShared';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DreamLeagueSetup'>;
type Rt = RouteProp<HomeStackParamList, 'DreamLeagueSetup'>;

const HOUR_MS = 3_600_000;

export function DreamLeagueSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { platformId, platformLabel, gameId, gameLabel } = route.params;

  const [stake, setStake] = useState('');
  const { acceptanceDue, setAcceptanceDue, gameStartTime, setGameStartTime } =
    useDateState();
  const [showAcceptance, setShowAcceptance] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [opponentType, setOpponentType] = useState<OpponentType | null>(null);
  const [friend, setFriend] = useState<MockFriend | null>(null);

  const stakeNum = Number(stake) || 0;
  const acceptanceMin = useMemo(() => new Date(Date.now() + HOUR_MS), []);
  const startMin = acceptanceDue
    ? new Date(acceptanceDue.getTime() + HOUR_MS)
    : new Date(Date.now() + 2 * HOUR_MS);

  const valid =
    stakeNum >= MIN_STAKE &&
    !!acceptanceDue &&
    !!gameStartTime &&
    !!opponentType &&
    (opponentType !== 'direct' || !!friend);

  const onContinue = () => {
    if (!valid || !acceptanceDue || !gameStartTime || !opponentType) return;
    const setup: ChallengeSetupData = {
      stake: stakeNum,
      acceptanceDue: acceptanceDue.toISOString(),
      gameStartTime: gameStartTime.toISOString(),
      opponentType,
      directOpponentId: friend?.id,
      directOpponentName: friend?.name,
      matchTime: 6,
    };
    navigation.navigate('ChallengeConfirm', {
      platformId,
      platformLabel,
      gameId,
      gameLabel,
      setup,
    });
  };

  return (
    <ScreenContainer testID="dreamleague-setup-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="dreamleague-back-btn"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.step}>Step 3 of 4</Text>
      </View>
      <Text style={styles.title}>{gameLabel}</Text>
      <Text style={styles.subtitle}>{platformLabel} · Configure your match</Text>

      <SectionHeader title="Match Settings" />
      <ReadonlyChip
        label="Match Time"
        value="3 min halves (6 min total)"
        testID="chip-match-time"
      />
      <ReadonlyChip
        label="Rules"
        value="Standard Rules"
        testID="chip-rules"
      />

      <SectionHeader title="Stake" />
      <StakeInput stake={stake} onChange={setStake} />

      <SectionHeader title="Schedule" />
      <DateRow
        label="Acceptance deadline"
        value={acceptanceDue}
        onPress={() => setShowAcceptance(true)}
        testID="acceptance-row"
      />
      <DateRow
        label="Match starts"
        value={gameStartTime}
        onPress={() => setShowStart(true)}
        testID="start-row"
      />

      <SectionHeader title="Opponent" />
      <OpponentPicker
        value={opponentType}
        onChange={setOpponentType}
        selectedFriend={friend}
        onSelectFriend={setFriend}
      />

      <View style={styles.footer}>
        <Button
          title="Continue →"
          onPress={onContinue}
          disabled={!valid}
          testID="dreamleague-continue-btn"
        />
      </View>

      <PlatformDatePicker
        visible={showAcceptance}
        value={acceptanceDue ?? acceptanceMin}
        minimumDate={acceptanceMin}
        onChange={setAcceptanceDue}
        onClose={() => setShowAcceptance(false)}
        testID="acceptance-picker"
      />
      <PlatformDatePicker
        visible={showStart}
        value={gameStartTime ?? startMin}
        minimumDate={startMin}
        onChange={setGameStartTime}
        onClose={() => setShowStart(false)}
        testID="start-picker"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backIcon: { color: colors.textMuted, fontSize: 26, lineHeight: 28 },
  step: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '700' },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  footer: { marginTop: spacing.xl },
});
