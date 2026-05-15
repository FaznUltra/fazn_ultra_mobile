import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors, spacing, radius } from '../../theme';

const ICON_SIZE = 22;
const ICON_COLOR = colors.primaryLight;

function ChallengeIcon() {
  // Crossed swords — depicts a head-to-head challenge
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3L10 10M21 3L14 10" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" />
      <Path d="M3 3H7V7" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 3H17V7" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 10L8.5 11.5M14 10L15.5 11.5" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" />
      <Path d="M9 12L12 21L15 12" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={9} y1={16} x2={15} y2={16} stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function TournamentIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={3} width={6} height={4} rx={1} stroke={ICON_COLOR} strokeWidth={2} />
      <Rect x={2} y={17} width={6} height={4} rx={1} stroke={ICON_COLOR} strokeWidth={2} />
      <Rect x={16} y={10} width={6} height={4} rx={1} stroke={ICON_COLOR} strokeWidth={2} />
      <Line x1={8} y1={5} x2={12} y2={5} stroke={ICON_COLOR} strokeWidth={2} />
      <Line x1={8} y1={19} x2={12} y2={19} stroke={ICON_COLOR} strokeWidth={2} />
      <Line x1={12} y1={5} x2={12} y2={19} stroke={ICON_COLOR} strokeWidth={2} />
      <Line x1={12} y1={12} x2={16} y2={12} stroke={ICON_COLOR} strokeWidth={2} />
    </Svg>
  );
}
function ArenaIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9H4.5C3.67 9 3 9.67 3 10.5V13.5C3 14.33 3.67 15 4.5 15H6M18 9H19.5C20.33 9 21 9.67 21 10.5V13.5C21 14.33 20.33 15 19.5 15H18" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" />
      <Rect x={6} y={5} width={12} height={14} rx={2} stroke={ICON_COLOR} strokeWidth={2} />
      <Line x1={10} y1={10} x2={10} y2={14} stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" />
      <Line x1={14} y1={10} x2={14} y2={14} stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function LeaderboardIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path d="M18 20V10M12 20V4M6 20V14" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function WalletIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={16} rx={2} stroke={ICON_COLOR} strokeWidth={2} />
      <Path d="M2 10H22" stroke={ICON_COLOR} strokeWidth={2} />
      <Circle cx={17} cy={15} r={1.5} fill={ICON_COLOR} />
    </Svg>
  );
}
function StatsIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12H18L15 21L9 3L6 12H2" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const SHORTCUTS = [
  { id: 'challenge', label: 'Challenge', Icon: ChallengeIcon },
  { id: 'tournament', label: 'Tournament', Icon: TournamentIcon },
  { id: 'arena', label: 'Arena', Icon: ArenaIcon },
  { id: 'leaderboard', label: 'Ranks', Icon: LeaderboardIcon },
  { id: 'wallet', label: 'Wallet', Icon: WalletIcon },
  { id: 'stats', label: 'My Stats', Icon: StatsIcon },
];

interface Props {
  onPress: (id: string) => void;
  testID?: string;
}

export function ShortcutsRow({ onPress, testID }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      testID={testID ?? 'shortcuts-row'}
    >
      {SHORTCUTS.map(({ id, label, Icon }) => (
        <TouchableOpacity
          key={id}
          style={styles.item}
          onPress={() => onPress(id)}
          accessibilityRole="button"
          testID={`shortcut-${id}`}
        >
          <View style={styles.iconWrap}>
            <Icon />
          </View>
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  item: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
