import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { HighestWin, TopRival } from '../../types/profile';
import { Avatar } from './Avatar';
import { colors, spacing, radius } from '../../theme';

function TrophyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 21H16M12 17V21M7 4H17L19 9C19 11.76 15.87 14 12 14C8.13 14 5 11.76 5 9L7 4Z"
        stroke="#f59e0b"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M5 9H2M19 9H22" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SwordsIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.5 17.5L3 6V3H6L17.5 14.5M14.5 17.5L17.5 20.5L21 17L18 14M14.5 17.5L18 14M6 14L3 17L6.5 20.5L9.5 17.5M6 14L9.5 10.5M6 14L9.5 17.5"
        stroke="#ec4899"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface WinCardProps {
  win: HighestWin;
  testID?: string;
}

function WinCard({ win, testID }: WinCardProps) {
  return (
    <View style={styles.card} testID={testID}>
      <View style={[styles.iconWrap, { backgroundColor: '#f59e0b22' }]}>
        <TrophyIcon />
      </View>
      <Text style={styles.cardTitle}>Highest Win</Text>
      <Text style={styles.highlight}>{win.score}</Text>
      <Text style={styles.gameLabel}>{win.gameName}</Text>
      <Text style={styles.opponent}>vs @{win.opponentUsername}</Text>
    </View>
  );
}

interface RivalCardProps {
  rival: TopRival;
  testID?: string;
}

function RivalCard({ rival, testID }: RivalCardProps) {
  const wlText = `${rival.winsAgainst}W – ${rival.lossesAgainst}L`;
  return (
    <View style={styles.card} testID={testID}>
      <View style={[styles.iconWrap, { backgroundColor: '#ec489922' }]}>
        <SwordsIcon />
      </View>
      <Text style={styles.cardTitle}>Top Rival</Text>
      <Avatar
        avatarUrl={rival.avatarUrl}
        firstName={rival.username.charAt(0)}
        lastName=""
        size={36}
        testID="rival-avatar"
      />
      <Text style={styles.highlight}>@{rival.username}</Text>
      <Text style={styles.opponent}>{wlText}</Text>
    </View>
  );
}

interface Props {
  highestWin: HighestWin | null;
  topRival: TopRival | null;
  testID?: string;
}

export function HighlightsRow({ highestWin, topRival, testID }: Props) {
  if (!highestWin && !topRival) {
    return (
      <View style={styles.emptyRow} testID={testID}>
        <Text style={styles.emptyText}>Play more matches to unlock your highlights.</Text>
      </View>
    );
  }

  return (
    <View style={styles.row} testID={testID}>
      {highestWin ? (
        <WinCard win={highestWin} testID="highlight-win-card" />
      ) : (
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyCardText}>No wins yet</Text>
        </View>
      )}
      {topRival ? (
        <RivalCard rival={topRival} testID="highlight-rival-card" />
      ) : (
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyCardText}>No rival yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlight: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  gameLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  opponent: {
    color: colors.textMuted,
    fontSize: 11,
  },
  emptyCard: {
    justifyContent: 'center',
  },
  emptyCardText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
