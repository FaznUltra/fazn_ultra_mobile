import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FriendsStackParamList } from '../../../navigation/types';
import { SearchUserCard } from '../../../components/friends/SearchUserCard';
import { useFriendSearch } from '../../../hooks/useFriendSearch';
import { colors, spacing } from '../../../theme';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendSearch'>;

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

function PhonebookIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2Z" stroke={colors.primaryLight} strokeWidth={2} />
      <Path d="M12 18H12.01M9 7H15M9 11H15" stroke={colors.primaryLight} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function FriendSearchScreen({ navigation }: Props) {
  const inputRef = useRef<TextInput>(null);
  const { query, searchState, handleQueryChange, updateUserStatus } = useFriendSearch();

  const handleSendRequest = (userId: string) => {
    updateUserStatus(userId, 'pending_sent');
  };

  const handleCancelRequest = (userId: string) => {
    updateUserStatus(userId, 'none');
  };

  const showEmpty = searchState.status === 'idle' && query.length === 0;
  const showMinChars = query.length > 0 && query.length < 3;
  const showLoading = searchState.status === 'loading';
  const showResults = searchState.status === 'success';
  const showError = searchState.status === 'error';
  const showNoResults = showResults && searchState.results.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']} testID="friend-search-screen">
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
            placeholder="Search players..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            testID="friend-search-input"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => handleQueryChange('')}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              testID="friend-search-clear"
            >
              <ClearIcon />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Import from phonebook banner */}
      <TouchableOpacity style={styles.phonebookBanner} accessibilityRole="button" testID="phonebook-btn">
        <View style={styles.phonebookIcon}>
          <PhonebookIcon />
        </View>
        <View style={styles.phonebookText}>
          <Text style={styles.phonebookTitle}>Find friends from contacts</Text>
          <Text style={styles.phonebookSub}>Import your phonebook to see who's on FAZN</Text>
        </View>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18L15 12L9 6" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      {/* States */}
      {showEmpty && (
        <View style={styles.stateWrap} testID="search-idle-state">
          <Text style={styles.stateTitle}>Find Players</Text>
          <Text style={styles.stateHint}>Search by name or username to connect with other players on FAZN.</Text>
        </View>
      )}

      {showMinChars && (
        <View style={styles.stateWrap} testID="search-min-chars-state">
          <Text style={styles.stateHint}>Keep typing — {3 - query.length} more character{3 - query.length > 1 ? 's' : ''}...</Text>
        </View>
      )}

      {showLoading && (
        <View style={styles.loadingWrap} testID="search-loading-state">
          <ActivityIndicator color={colors.primaryLight} size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {showError && (
        <View style={styles.stateWrap} testID="search-error-state">
          <Text style={styles.stateTitle}>Search failed</Text>
          <Text style={styles.stateHint}>{(searchState as { message: string }).message}</Text>
        </View>
      )}

      {showNoResults && (
        <View style={styles.stateWrap} testID="search-no-results-state">
          <Text style={styles.stateTitle}>No players found</Text>
          <Text style={styles.stateHint}>Try a different name or username.</Text>
        </View>
      )}

      {showResults && !showNoResults && (
        <FlatList
          data={(searchState as { results: ReturnType<typeof useFriendSearch>['searchState'] & { results?: [] } }).results as []}
          keyExtractor={(item: { id: string }) => item.id}
          renderItem={({ item }: { item: Parameters<typeof SearchUserCard>[0]['user'] }) => (
            <SearchUserCard
              user={item}
              onSendRequest={handleSendRequest}
              onCancelRequest={handleCancelRequest}
              testID={`search-result-${item.id}`}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  phonebookBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight + '33',
    gap: spacing.sm,
  },
  phonebookIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonebookText: { flex: 1 },
  phonebookTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  phonebookSub: { color: colors.textMuted, fontSize: 11 },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  stateTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  stateHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: 80,
  },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
  listContent: { paddingBottom: spacing.xl },
});
