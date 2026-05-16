import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SectionList,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius } from '../../../theme';
import { useArena } from '../../../hooks/useArena';
import { ArenaSkeleton } from '../../../components/arena/ArenaSkeleton';
import { ArenaChallengeCard } from '../../../components/arena/ArenaChallengeCard';
import { BellIcon, PlusIcon } from '../../../components/arena/ArenaIcons';
import type { ArenaChallenge, ChallengeStatus } from '../../../types/arena';
import type { ArenaStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ArenaStackParamList, 'ArenaMain'>;

type TabKey = 'marketplace' | 'my-bets' | 'live' | 'invited';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'my-bets', label: 'My Bets' },
  { key: 'live', label: 'Live' },
  { key: 'invited', label: 'Invited' },
];

const MY_BET_FILTERS = [
  'All',
  'Active',
  'Upcoming',
  'Live',
  'Awaiting Result',
  'Completed',
  'Cancelled',
  'Void',
] as const;
type MyBetFilter = (typeof MY_BET_FILTERS)[number];

const ACTIVE_STATUSES: ChallengeStatus[] = [
  'accepted',
  'live',
  'awaiting_result',
  'disputed',
];

function matchesFilter(c: ArenaChallenge, filter: MyBetFilter): boolean {
  switch (filter) {
    case 'All':
      return true;
    case 'Active':
      return ACTIVE_STATUSES.includes(c.status);
    case 'Upcoming':
      return (
        c.status === 'accepted' &&
        new Date(c.gameStartTime).getTime() > Date.now()
      );
    case 'Live':
      return c.status === 'live';
    case 'Awaiting Result':
      return c.status === 'awaiting_result' || c.status === 'disputed';
    case 'Completed':
      return c.status === 'completed';
    case 'Cancelled':
      return ['cancelled', 'expired', 'rejected'].includes(c.status);
    case 'Void':
      return c.status === 'void' || c.status === 'refunded';
    default:
      return true;
  }
}

function recencyGroup(c: ArenaChallenge): 'Today' | 'This Week' | 'Earlier' {
  const ref = new Date(c.createdAt).getTime();
  const ageMs = Date.now() - ref;
  if (ageMs < 86_400_000) return 'Today';
  if (ageMs < 7 * 86_400_000) return 'This Week';
  return 'Earlier';
}

export function ArenaScreen() {
  const navigation = useNavigation<Nav>();
  const {
    state,
    acceptInvite,
    rejectInvite,
    cancelChallenge,
    submitResult,
    refresh,
  } = useArena();

  const [tab, setTab] = useState<TabKey>('marketplace');
  const [myBetFilter, setMyBetFilter] = useState<MyBetFilter>('All');

  const data = state.status === 'success' ? state.data : null;

  const liveCount = useMemo(
    () =>
      data
        ? data.myChallenges.filter(
            (c) => c.status === 'live' || c.status === 'accepted',
          ).length
        : 0,
    [data],
  );
  const invitedCount = data ? data.invited.length : 0;

  const openDetail = (challengeId: string) =>
    navigation.navigate('ChallengeDetail', { challengeId });

  const startCreateChallenge = () =>
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Home',
        params: { screen: 'SelectPlatform' },
      }),
    );

  const onSubmitResultPrompt = (c: ArenaChallenge) => {
    Alert.alert('Submit Result', `What was the outcome of ${c.game}?`, [
      { text: 'I Won', onPress: () => submitResult(c.id, 'win') },
      { text: 'I Lost', onPress: () => submitResult(c.id, 'loss') },
      { text: 'Draw', onPress: () => submitResult(c.id, 'draw') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Header ────────────────────────────────────────────────────────────
  const Header = (
    <View style={styles.header}>
      <Text style={styles.title}>Arena</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            Alert.alert('Notifications', 'Arena notifications coming soon.')
          }
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          testID="arena-notification-btn"
        >
          <BellIcon size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={startCreateChallenge}
          accessibilityRole="button"
          accessibilityLabel="Create challenge"
          testID="arena-create-btn"
        >
          <PlusIcon size={14} color="#ffffff" />
          <Text style={styles.createText}>Create Challenge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Tab bar ───────────────────────────────────────────────────────────
  const TabBar = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabBar}
      contentContainerStyle={styles.tabBarContent}
    >
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabPill, active && styles.tabPillActive]}
            onPress={() => setTab(t.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            testID={`arena-tab-${t.key}`}
          >
            <Text
              style={[styles.tabText, active && styles.tabTextActive]}
            >
              {t.label}
            </Text>
            {t.key === 'live' && liveCount > 0 && (
              <View style={styles.liveDot} testID="arena-tab-live-dot" />
            )}
            {t.key === 'invited' && invitedCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{invitedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── Loading / error ───────────────────────────────────────────────────
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View testID="arena-screen" style={styles.flex}>
          {Header}
          <ArenaSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View testID="arena-screen" style={styles.flex}>
          {Header}
          <View style={styles.center} testID="arena-error">
            <Text style={styles.errorText}>{state.message}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={refresh}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              testID="arena-retry"
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const d = state.data;

  const EmptyState = ({
    message,
    showCreate,
    testID,
  }: {
    message: string;
    showCreate?: boolean;
    testID?: string;
  }) => (
    <View style={styles.empty} testID={testID}>
      <Text style={styles.emptyText}>{message}</Text>
      {showCreate && (
        <TouchableOpacity
          style={styles.createBtn}
          onPress={startCreateChallenge}
          accessibilityRole="button"
          accessibilityLabel="Create challenge"
          testID="arena-empty-create-btn"
        >
          <PlusIcon size={14} color="#ffffff" />
          <Text style={styles.createText}>Create Challenge</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Tab content ───────────────────────────────────────────────────────
  let content: React.ReactNode = null;

  if (tab === 'marketplace') {
    content = (
      <FlatList
        testID="marketplace-list"
        data={d.marketplace}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => Alert.alert('Filter', 'Game filter coming soon.')}
              accessibilityRole="button"
              accessibilityLabel="Filter by game"
            >
              <Text style={styles.filterText}>All Games ▾</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => Alert.alert('Sort', 'Sort options coming soon.')}
              accessibilityRole="button"
              accessibilityLabel="Sort challenges"
            >
              <Text style={styles.filterText}>Sort: Soonest ▾</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ArenaChallengeCard
            challenge={item}
            variant="marketplace"
            onPress={() => openDetail(item.id)}
            testID={`marketplace-card-${item.id}`}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            message="No open challenges right now. Create one!"
            showCreate
            testID="marketplace-empty"
          />
        }
      />
    );
  }

  if (tab === 'my-bets') {
    const filtered = d.myChallenges.filter((c) =>
      matchesFilter(c, myBetFilter),
    );
    const order = ['Today', 'This Week', 'Earlier'] as const;
    const sections = order
      .map((g) => ({
        title: g,
        data: filtered.filter((c) => recencyGroup(c) === g),
      }))
      .filter((s) => s.data.length > 0);

    content = (
      <View style={styles.flex}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subFilterBar}
          contentContainerStyle={styles.subFilterContent}
        >
          {MY_BET_FILTERS.map((f) => {
            const active = myBetFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.subPill, active && styles.subPillActive]}
                onPress={() => setMyBetFilter(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={f}
                testID={`my-bets-filter-${f}`}
              >
                <Text
                  style={[
                    styles.subPillText,
                    active && styles.subPillTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <SectionList
          testID="my-bets-list"
          sections={sections}
          keyExtractor={(i) => i.id}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ArenaChallengeCard
              challenge={item}
              variant="my-bet"
              onPress={() => openDetail(item.id)}
              onCancel={() => cancelChallenge(item.id)}
              onSubmitResult={() => onSubmitResultPrompt(item)}
              testID={`my-bets-card-${item.id}`}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              message="No challenges in this filter."
              testID="my-bets-empty"
            />
          }
        />
      </View>
    );
  }

  if (tab === 'live') {
    const live = d.myChallenges.filter((c) => c.status === 'live');
    const upcoming = d.myChallenges.filter(
      (c) =>
        c.status === 'accepted' &&
        new Date(c.gameStartTime).getTime() > Date.now(),
    );

    content = (
      <FlatList
        testID="live-list"
        data={live}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.liveHeader}>
            <View style={styles.liveDotLg} />
            <Text style={styles.liveHeaderText}>
              LIVE · {live.length} now
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ArenaChallengeCard
            challenge={item}
            variant="live"
            onPress={() => openDetail(item.id)}
            testID={`live-card-${item.id}`}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            message="No live challenges. Check back soon."
            testID="live-empty"
          />
        }
        ListFooterComponent={
          upcoming.length > 0 ? (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Upcoming</Text>
              </View>
              {upcoming.map((item) => (
                <ArenaChallengeCard
                  key={item.id}
                  challenge={item}
                  variant="live"
                  onPress={() => openDetail(item.id)}
                  testID={`live-upcoming-card-${item.id}`}
                />
              ))}
            </View>
          ) : null
        }
      />
    );
  }

  if (tab === 'invited') {
    content = (
      <FlatList
        testID="invited-list"
        data={d.invited}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.invitedHeader}>
            Challenges waiting for your response
          </Text>
        }
        renderItem={({ item }) => (
          <ArenaChallengeCard
            challenge={item}
            variant="invited"
            onPress={() => openDetail(item.id)}
            onAccept={() => acceptInvite(item.id)}
            onReject={() => rejectInvite(item.id)}
            testID={`invited-card-${item.id}`}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            message="No pending invitations"
            testID="invited-empty"
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View testID="arena-screen" style={styles.flex}>
        {Header}
        {TabBar}
        <View style={styles.flex}>{content}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '700' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 20,
  },
  createText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  tabBar: { flexGrow: 0, marginTop: spacing.xs },
  tabBarContent: {
    paddingHorizontal: 20,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  tabBadge: {
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: spacing.xl },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  subFilterBar: { flexGrow: 0 },
  subFilterContent: {
    paddingHorizontal: 20,
    gap: spacing.xs + 2,
    paddingBottom: spacing.sm,
  },
  subPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subPillActive: {
    backgroundColor: colors.primaryLight + '22',
    borderColor: colors.primaryLight,
  },
  subPillText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  subPillTextActive: { color: colors.primaryLight },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
  },
  sectionHeaderText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  liveDotLg: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  liveHeaderText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  invitedHeader: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: spacing.md,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
