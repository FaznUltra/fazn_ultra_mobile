import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius } from '../../../theme';
import {
  gamesForPlatform,
  gamesByGenre,
  GENRE_COLORS,
  type Game,
} from '../../../data/gamesData';
import { SearchSvg } from './PlatformIcons';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SelectGame'>;
type Rt = RouteProp<HomeStackParamList, 'SelectGame'>;

interface Props {
  route?: { params: { platformId: string; platformLabel: string } };
}

export function SelectGameScreen({ route: routeProp }: Props) {
  const navigation = useNavigation<Nav>();
  const hookRoute = useRoute<Rt>();
  const { platformId, platformLabel } = routeProp?.params ?? hookRoute.params;

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sections = useMemo(() => {
    const games = gamesForPlatform(platformId).filter((g) =>
      g.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const grouped = gamesByGenre(games);
    return Object.keys(grouped)
      .sort()
      .map((genre) => ({ title: genre, data: grouped[genre] }));
  }, [platformId, query]);

  const hasResults = sections.length > 0;

  const onContinue = () => {
    if (!selectedId) return;
    const selectedGame = gamesForPlatform(platformId).find(
      (g) => g.id === selectedId,
    );
    if (!selectedGame) return;
    const params = {
      platformId,
      platformLabel,
      gameId: selectedGame.id,
      gameLabel: selectedGame.name,
    };
    switch (selectedGame.id) {
      case 'efootball_mob':
        navigation.navigate('EFootballSetup', params);
        break;
      case 'dream_league':
        navigation.navigate('DreamLeagueSetup', params);
        break;
      default:
        Alert.alert(
          'Coming soon',
          "This game's challenge setup is coming soon.",
        );
    }
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="select-game-screen"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerSide}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="game-back-btn"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {platformLabel}
        </Text>
        <View style={styles.headerSide}>
          <Text style={styles.step}>2 of 2</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchSvg size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search games…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          accessibilityLabel="Search games"
          testID="game-search-input"
        />
      </View>

      {hasResults ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {sections.map((section) => (
            <View key={section.title}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
                <View style={styles.sectionLine} />
              </View>
              {section.data.map((item: Game) => {
                const isSelected = item.id === selectedId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.row, isSelected && styles.rowSelected]}
                    onPress={() => setSelectedId(item.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.name}
                    testID={`game-row-${item.id}`}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            GENRE_COLORS[item.genre] ?? colors.textMuted,
                        },
                      ]}
                    />
                    <View style={styles.rowMain}>
                      <Text style={styles.gameName}>{item.name}</Text>
                      <View style={styles.modesRow}>
                        {item.modes.map((m) => (
                          <View key={m} style={styles.modePill}>
                            <Text style={styles.modePillText}>{m}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {item.popular && (
                      <View style={styles.popularChip}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.empty} testID="game-empty-state">
          <Text style={styles.emptyText}>
            No games found for &lsquo;{query}&rsquo;
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onContinue}
          disabled={!selectedId}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedId }}
          accessibilityLabel="Continue"
          style={[
            styles.continueBtn,
            !selectedId && styles.continueBtnDisabled,
          ]}
          testID="game-continue-btn"
        >
          <Text
            style={[
              styles.continueText,
              !selectedId && styles.continueTextDisabled,
            ]}
          >
            Continue →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSide: { width: 56, justifyContent: 'center' },
  backIcon: { color: colors.textMuted, fontSize: 26, lineHeight: 28 },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  step: { color: colors.textMuted, fontSize: 13, textAlign: 'right' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: 20,
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 22,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  listContent: { paddingBottom: spacing.xl },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionHeaderText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  sectionLine: { height: 1, backgroundColor: colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    gap: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  rowSelected: {
    backgroundColor: colors.primary + '10',
    borderLeftColor: colors.primary,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowMain: { flex: 1, gap: 4 },
  gameName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  modesRow: { flexDirection: 'row', gap: spacing.xs },
  modePill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  modePillText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  popularChip: {
    backgroundColor: colors.primaryLight + '22',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  popularText: { color: colors.primaryLight, fontSize: 10, fontWeight: '700' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  continueBtn: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { backgroundColor: colors.surface },
  continueText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  continueTextDisabled: { color: colors.textMuted },
});
