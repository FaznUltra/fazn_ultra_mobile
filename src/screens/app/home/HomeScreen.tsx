import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  type ViewToken,
  type FlatList as FlatListType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURED_CARD_WIDTH = Dimensions.get('window').width - 48;
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { HomeHeader, SearchBarTap } from '../../../components/home/HomeHeader';
import { ShortcutsRow } from '../../../components/home/ShortcutsRow';
import { ChallengeCard } from '../../../components/home/ChallengeCard';
import { StreamCard } from '../../../components/home/StreamCard';
import { HomeSkeleton } from '../../../components/home/HomeSkeleton';
import { useHome } from '../../../hooks/useHome';
import { colors, spacing, radius } from '../../../theme';
import type { Challenge, LiveStream } from '../../../types/home';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          accessibilityRole="button"
          testID={`see-all-${title.replace(/\s/g, '-').toLowerCase()}`}
        >
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { state, retry, likeStream } = useHome();
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const flatListRef = useRef<FlatListType<LiveStream>>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveStreamId(viewableItems[0].item.id as string);
      }
    },
  );

  const goChallenge = useCallback(
    (id: string) => navigation.navigate('ChallengeDetail', { challengeId: id }),
    [navigation],
  );
  const goHost = useCallback(
    (userId: string, username: string) =>
      navigation.navigate('UserPublicProfile', { userId, username }),
    [navigation],
  );

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={['top', 'left', 'right']}
        testID="home-screen"
      >
        <View style={styles.errorWrap} testID="home-error">
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorHint}>{state.message}</Text>
          <TouchableOpacity
            onPress={retry}
            style={styles.retryBtn}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            testID="home-retry"
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { data } = state;

  const renderHeader = () => (
    <View>
      <HomeHeader
        walletBalance={data.walletBalance}
        walletCurrency={data.walletCurrency}
        notificationCount={data.notificationCount}
        onSearchPress={() => navigation.navigate('GlobalSearch')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onWalletPress={() => navigation.navigate('WalletMain')}
      />
      <SearchBarTap onPress={() => navigation.navigate('GlobalSearch')} />
      <ShortcutsRow
        onPress={(id) => {
          if (id === 'wallet') {
            navigation.navigate('WalletMain');
          } else {
            Alert.alert('Coming soon', `${id} is not available yet.`);
          }
        }}
      />

      {/* Featured */}
      <SectionHeader
        title="Featured Challenges"
        onSeeAll={() =>
          Alert.alert('Featured', 'Full list coming soon.')
        }
      />
      <FlatList
        data={data.featuredChallenges}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.featuredListContent}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={FEATURED_CARD_WIDTH + spacing.sm}
        renderItem={({ item }: { item: Challenge }) => (
          <View style={styles.featuredItem}>
            <ChallengeCard
              challenge={item}
              variant="featured"
              onPress={() => goChallenge(item.id)}
              onJoinPress={() => goChallenge(item.id)}
            />
          </View>
        )}
        testID="home-featured-list"
      />

      {/* Hot */}
      <SectionHeader title="Hot Challenges" />
      <FlatList
        data={data.hotChallenges}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.hotListContent}
        renderItem={({ item }: { item: Challenge }) => (
          <ChallengeCard
            challenge={item}
            variant="hot"
            onPress={() => goChallenge(item.id)}
            onJoinPress={() => goChallenge(item.id)}
          />
        )}
        testID="home-hot-list"
      />

      {/* Streams */}
      <SectionHeader title="Live Streams" />
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="home-screen"
    >
      <FlatList
        data={data.streams}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }: { item: LiveStream; index: number }) => (
          <View style={styles.streamWrap}>
            <StreamCard
              stream={item}
              isPlaying={activeStreamId === item.id}
              onPress={() =>
                flatListRef.current?.scrollToIndex({ index, animated: true })
              }
              onLike={() => likeStream(item.id)}
              onShare={() =>
                Alert.alert('Share', 'Sharing coming soon.')
              }
              onHostPress={() =>
                goHost(item.host.id, item.host.username)
              }
              testID={`stream-card-${item.id}`}
            />
          </View>
        )}
        ref={flatListRef}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        contentContainerStyle={styles.listContent}
        testID="home-streams-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl },
  streamWrap: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  featuredListContent: { paddingHorizontal: 20, gap: spacing.sm },
  featuredItem: { width: FEATURED_CARD_WIDTH },
  hotListContent: { paddingHorizontal: 20 },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  errorHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
