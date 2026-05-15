import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { SearchResultItem } from '../../../components/home/SearchResultItem';
import { useGlobalSearch } from '../../../hooks/useGlobalSearch';
import { colors, spacing, radius } from '../../../theme';
import type { GroupedSearchResults, SearchResult } from '../../../types/home';

type Props = NativeStackScreenProps<HomeStackParamList, 'GlobalSearch'>;

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClearIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} fill={colors.textMuted} />
      <Path d="M9 9L15 15M15 9L9 15" stroke={colors.background} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const TRENDING: SearchResult[] = [
  { type: 'game', id: 'g1', title: 'EA FC 25', subtitle: '1,240 active players', gameBg: '#14532d' },
  { type: 'game', id: 'g2', title: 'Call of Duty', subtitle: '890 active players', gameBg: '#1e3a5f' },
  { type: 'game', id: 'g3', title: 'NBA 2K25', subtitle: '620 active players', gameBg: '#7c2d12' },
  { type: 'game', id: 'g4', title: 'Mortal Kombat', subtitle: '310 active players', gameBg: '#7c1d1d' },
];

const SECTION_LABELS: Record<keyof GroupedSearchResults, string> = {
  players: 'Players',
  challenges: 'Challenges',
  tournaments: 'Tournaments',
  streams: 'Live Streams',
  games: 'Games',
};

export function GlobalSearchScreen({ navigation }: Props) {
  const inputRef = useRef<TextInput>(null);
  const { query, searchState, handleQueryChange, totalResults } =
    useGlobalSearch();

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'player':
        navigation.navigate('UserPublicProfile', {
          userId: result.id,
          username: result.subtitle.replace('@', ''),
        });
        break;
      case 'challenge':
      case 'tournament':
        navigation.navigate('ChallengeDetail', { challengeId: result.id });
        break;
      case 'stream':
        navigation.navigate('StreamDetail', { streamId: result.id });
        break;
      case 'game':
        Alert.alert('Coming soon', `${result.title} hub is not available yet.`);
        break;
    }
  };

  const renderTrendingTile = (item: SearchResult) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.trendTile, { backgroundColor: item.gameBg }]}
      onPress={() => handleResultPress(item)}
      accessibilityRole="button"
      testID={`trending-${item.id}`}
    >
      <Text style={styles.trendTitle}>{item.title}</Text>
      <Text style={styles.trendSub}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  const sections =
    searchState.status === 'success'
      ? (Object.keys(SECTION_LABELS) as (keyof GroupedSearchResults)[])
          .map((key) => ({
            key,
            title: SECTION_LABELS[key],
            data: searchState.results[key],
          }))
          .filter((s) => s.data.length > 0)
      : [];

  const showIdle =
    searchState.status === 'idle';
  const showLoading = searchState.status === 'loading';
  const showError = searchState.status === 'error';
  const showEmpty =
    searchState.status === 'success' &&
    totalResults(searchState.results) === 0;
  const showResults =
    searchState.status === 'success' && sections.length > 0;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="global-search-screen"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="search-back-btn"
        >
          <BackIcon />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search players, challenges, games..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            testID="search-input"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => handleQueryChange('')}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              testID="search-clear-btn"
            >
              <ClearIcon />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showIdle && (
        <View style={styles.idleWrap} testID="search-idle-state">
          <Text style={styles.idleTitle}>Trending</Text>
          <View style={styles.trendGrid}>
            {TRENDING.map(renderTrendingTile)}
          </View>
        </View>
      )}

      {showLoading && (
        <View style={styles.centerWrap} testID="search-loading-state">
          <ActivityIndicator color={colors.primaryLight} size="large" />
          <Text style={styles.centerText}>Searching...</Text>
        </View>
      )}

      {showError && (
        <View style={styles.centerWrap} testID="search-error-state">
          <Text style={styles.stateTitle}>Search failed</Text>
          <Text style={styles.centerText}>
            {(searchState as { message: string }).message}
          </Text>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centerWrap} testID="search-empty-state">
          <Text style={styles.stateTitle}>
            No results for "{(searchState as { query: string }).query}"
          </Text>
          <Text style={styles.centerText}>
            Try a different name, game or challenge.
          </Text>
        </View>
      )}

      {showResults && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <SearchResultItem
              result={item}
              onPress={() => handleResultPress(item)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{section.data.length}</Text>
              </View>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          testID="search-results-list"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: { paddingLeft: spacing.sm },
  idleWrap: { flex: 1, paddingHorizontal: 20, paddingTop: spacing.sm },
  idleTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  trendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  trendTile: {
    width: '47%',
    height: 90,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  trendTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  trendSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  centerText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  stateTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: { paddingBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
