import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, radius } from '../../theme';
import { Avatar } from '../profile/Avatar';
import type { SearchResult } from '../../types/home';

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={colors.textMuted}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TYPE_GLYPH: Record<SearchResult['type'], string> = {
  player: 'P',
  challenge: 'C',
  tournament: 'T',
  stream: 'L',
  game: 'G',
};

interface Props {
  result: SearchResult;
  onPress: () => void;
  testID?: string;
}

export function SearchResultItem({ result, onPress, testID }: Props) {
  const initials = result.title
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('');

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={result.title}
      testID={testID ?? `search-result-${result.id}`}
    >
      <View style={styles.leading}>
        {result.type === 'player' ? (
          <Avatar
            avatarUrl={result.avatarUrl}
            firstName={initials.charAt(0) || 'U'}
            lastName={initials.charAt(1) || ''}
            size={36}
          />
        ) : (
          <View
            style={[
              styles.thumb,
              { backgroundColor: result.gameBg ?? colors.surface },
            ]}
          >
            <Text style={styles.thumbGlyph}>
              {TYPE_GLYPH[result.type]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {result.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {result.subtitle}
        </Text>
      </View>

      <View style={styles.trailing}>
        {!!result.meta && (
          <Text style={styles.meta} numberOfLines={1}>
            {result.meta}
          </Text>
        )}
        <ChevronIcon />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: spacing.md,
  },
  leading: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: { color: '#fff', fontSize: 16, fontWeight: '800' },
  middle: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '40%',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    flexShrink: 1,
  },
});
