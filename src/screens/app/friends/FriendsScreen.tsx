import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  type SectionListData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FriendsStackParamList } from '../../../navigation/types';
import { FriendCard } from '../../../components/friends/FriendCard';
import { FriendsSkeleton } from '../../../components/friends/FriendsSkeleton';
import { SearchUserCard } from '../../../components/friends/SearchUserCard';
import { useFriends } from '../../../hooks/useFriends';
import type { FriendUser } from '../../../types/friends';
import { colors, spacing, radius } from '../../../theme';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendsList'>;

type Tab = 'friends' | 'favourites' | 'discover';

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={colors.textSecondary} strokeWidth={2} />
      <Path d="M20 20L16.65 16.65" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function BellIcon({ count }: { count: number }) {
  return (
    <View style={styles.bellWrap}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8"
          stroke={colors.textSecondary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.73 21C13.55 21.3 13.28 21.55 12.97 21.72C12.66 21.89 12.33 21.97 12 21.97C11.67 21.97 11.34 21.89 11.03 21.72C10.72 21.55 10.45 21.3 10.27 21"
          stroke={colors.textSecondary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function TabPill({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabPill, active && styles.tabPillActive]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      testID={testID}
    >
      <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: title === 'Online' ? colors.success : title === 'In Game' ? colors.primaryLight : '#4b5563' }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyMessage}>{message}</Text>
      <Text style={styles.emptyHint}>{hint}</Text>
    </View>
  );
}

export function FriendsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const { state, retry, toggleFavourite, unfriend, sendRequest, cancelRequest } = useFriends();

  const requestCount = state.status === 'success' ? state.data.requestCount : 0;

  const friendSections = useMemo<SectionListData<FriendUser>[]>(() => {
    if (state.status !== 'success') return [];
    const friends = state.data.friends;
    const online = friends.filter((f) => f.onlineStatus === 'online');
    const inGame = friends.filter((f) => f.onlineStatus === 'in_game');
    const offline = friends.filter((f) => f.onlineStatus === 'offline');
    const sections: SectionListData<FriendUser>[] = [];
    if (inGame.length) sections.push({ title: 'In Game', data: inGame });
    if (online.length) sections.push({ title: 'Online', data: online });
    if (offline.length) sections.push({ title: 'Offline', data: offline });
    return sections;
  }, [state]);

  const favourites = useMemo(() => {
    if (state.status !== 'success') return [];
    return state.data.friends.filter((f) => f.isFavourite);
  }, [state]);

  const suggestions = useMemo(() => {
    if (state.status !== 'success') return [];
    return state.data.suggestions;
  }, [state]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']} testID="friends-screen">
      {/* Page header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('FriendRequests')}
            accessibilityRole="button"
            accessibilityLabel="Friend requests"
            testID="friends-requests-btn"
          >
            <BellIcon count={requestCount} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('FriendSearch')}
            accessibilityRole="button"
            accessibilityLabel="Search users"
            testID="friends-search-btn"
          >
            <SearchIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabPill
          label="Friends"
          active={activeTab === 'friends'}
          onPress={() => setActiveTab('friends')}
          testID="tab-pill-friends"
        />
        <TabPill
          label="Favourites"
          active={activeTab === 'favourites'}
          onPress={() => setActiveTab('favourites')}
          testID="tab-pill-favourites"
        />
        <TabPill
          label="Discover"
          active={activeTab === 'discover'}
          onPress={() => setActiveTab('discover')}
          testID="tab-pill-discover"
        />
      </View>

      {/* Content */}
      {(state.status === 'idle' || state.status === 'loading') && (
        <FriendsSkeleton />
      )}

      {state.status === 'error' && (
        <View style={styles.errorState} testID="friends-error">
          <Text style={styles.errorText}>{state.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={retry} testID="friends-retry">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {state.status === 'success' && activeTab === 'friends' && (
        friendSections.length === 0 ? (
          <EmptyState
            message="No friends yet"
            hint="Search for players and send a friend request."
          />
        ) : (
          <SectionList
            sections={friendSections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FriendCard
                friend={item}
                onToggleFavourite={toggleFavourite}
                onUnfriend={unfriend}
                testID={`friend-card-${item.id}`}
              />
            )}
            renderSectionHeader={({ section }) => (
              <SectionHeader title={section.title as string} count={section.data.length} />
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            testID="friends-list"
          />
        )
      )}

      {state.status === 'success' && activeTab === 'favourites' && (
        favourites.length === 0 ? (
          <EmptyState
            message="No favourites yet"
            hint="Star a friend to pin them here for quick access."
          />
        ) : (
          <SectionList
            sections={[{ title: 'Favourites', data: favourites }]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FriendCard
                friend={item}
                onToggleFavourite={toggleFavourite}
                onUnfriend={unfriend}
                testID={`favourite-card-${item.id}`}
              />
            )}
            renderSectionHeader={() => null}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            testID="favourites-list"
          />
        )
      )}

      {state.status === 'success' && activeTab === 'discover' && (
        suggestions.length === 0 ? (
          <EmptyState
            message="No suggestions right now"
            hint="Add more friends to see who else you might know."
          />
        ) : (
          <SectionList
            sections={[{ title: 'Suggested', data: suggestions }]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SearchUserCard
                user={item}
                onSendRequest={sendRequest}
                onCancelRequest={cancelRequest}
                testID={`discover-card-${item.id}`}
              />
            )}
            renderSectionHeader={() => (
              <View style={styles.discoverHeader}>
                <Text style={styles.discoverLabel}>People you may know</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            testID="discover-list"
          />
        )
      )}
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellWrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingBottom: spacing.md,
  },
  tabPill: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabPillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabPillTextActive: { color: '#fff' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
  listContent: { paddingBottom: spacing.xl },
  discoverHeader: {
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  discoverLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
