import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Button } from '../../../components/ui/Button';
import { colors, spacing, radius } from '../../../theme';
import { formatNaira } from '../../../utils/wallet';
import type { HomeStackParamList } from '../../../navigation/types';
import { FEE_RATE, formatDateTime } from './setupShared';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ChallengeConfirm'>;
type Rt = RouteProp<HomeStackParamList, 'ChallengeConfirm'>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function createChallengeMock(): Promise<{ challengeId: string }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ challengeId: `ch_${Date.now()}` }), 400),
  );
}

const OPP_LABEL: Record<string, string> = {
  public: 'Public — anyone can accept',
  private: 'Friends Only',
  direct: 'Direct Challenge',
};

export function ChallengeConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { gameLabel, platformLabel, setup } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const fee = Math.round(setup.stake * 2 * FEE_RATE);
  const potential = Math.round(setup.stake * 2 * (1 - FEE_RATE));

  const onCreate = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { challengeId } = await createChallengeMock();
      navigation.navigate('ChallengeSuccess', {
        challengeId,
        gameLabel,
        opponentName:
          setup.opponentType === 'direct'
            ? setup.directOpponentName
            : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer testID="challenge-confirm-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="confirm-back-btn"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.step}>Step 4 of 4</Text>
      </View>
      <Text style={styles.title}>Review Challenge</Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameName}>{gameLabel}</Text>
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{platformLabel}</Text>
        </View>
      </View>

      <SectionHeader title="Match Settings" />
      {setup.matchTime != null && (
        <Row label="Match Time" value={`${setup.matchTime} min`} />
      )}
      {setup.penalties != null && (
        <Row label="Penalties" value={setup.penalties ? 'Yes' : 'No'} />
      )}
      {setup.extraTime != null && (
        <Row label="Extra Time" value={setup.extraTime ? 'Yes' : 'Off'} />
      )}
      {setup.substitutions != null && (
        <Row label="Substitutions" value={String(setup.substitutions)} />
      )}
      {setup.teamCondition != null && (
        <Row
          label="Team Condition"
          value={
            setup.teamCondition.charAt(0).toUpperCase() +
            setup.teamCondition.slice(1)
          }
        />
      )}

      <SectionHeader title="Stake" />
      <Row label="Your stake" value={formatNaira(setup.stake)} />
      <Row label="Platform fee (5%)" value={formatNaira(fee)} />
      <Row label="Potential win" value={formatNaira(potential)} />

      <SectionHeader title="Schedule" />
      <Row
        label="Acceptance deadline"
        value={formatDateTime(new Date(setup.acceptanceDue))}
      />
      <Row
        label="Match starts"
        value={formatDateTime(new Date(setup.gameStartTime))}
      />

      <SectionHeader title="Opponent" />
      <Row
        label="Type"
        value={
          setup.opponentType === 'direct' && setup.directOpponentName
            ? `Direct — ${setup.directOpponentName}`
            : OPP_LABEL[setup.opponentType]
        }
      />

      <Text style={styles.disclaimer}>
        By creating this challenge, you agree to the FAZN terms. Stake will be
        deducted from your wallet.
      </Text>

      <View style={styles.actions}>
        <Button
          title="Edit"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.editBtn}
          fullWidth={false}
          testID="confirm-edit-btn"
        />
        <Button
          title="Create Challenge"
          onPress={onCreate}
          loading={submitting}
          style={styles.createBtn}
          fullWidth={false}
          testID="confirm-create-btn"
        />
      </View>
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
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  gameName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  platformBadge: {
    backgroundColor: colors.primary + '22',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  platformText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  editBtn: { flex: 1 },
  createBtn: { flex: 2 },
});
