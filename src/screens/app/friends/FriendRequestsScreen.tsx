import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  type SectionListData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FriendsStackParamList } from '../../../navigation/types';
import { FriendRequestCard } from '../../../components/friends/FriendRequestCard';
import { FriendsSkeleton } from '../../../components/friends/FriendsSkeleton';
import { useFriendRequests } from '../../../hooks/useFriends';
import type { FriendRequest } from '../../../types/friends';
import { colors, spacing } from '../../../theme';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendRequests'>;

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FriendRequestsScreen({ navigation }: Props) {
  const { state, retry, acceptRequest, rejectRequest, cancelOutgoing } = useFriendRequests();

  const incoming = state.status === 'success' ? state.data.filter((r) => r.direction === 'incoming') : [];
  const outgoing = state.status === 'success' ? state.data.filter((r) => r.direction === 'outgoing') : [];

  const sections: SectionListData<FriendRequest>[] = [];
  if (incoming.length) sections.push({ title: 'Incoming', data: incoming });
  if (outgoing.length) sections.push({ title: 'Sent', data: outgoing });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']} testID="friend-requests-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="requests-back-btn"
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.title}>Friend Requests</Text>
        {incoming.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{incoming.length}</Text>
          </View>
        )}
      </View>

      {(state.status === 'idle' || state.status === 'loading') && (
        <FriendsSkeleton count={4} />
      )}

      {state.status === 'error' && (
        <View style={styles.errorState} testID="requests-error">
          <Text style={styles.errorText}>{state.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={retry} testID="requests-retry">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {state.status === 'success' && sections.length === 0 && (
        <View style={styles.empty} testID="requests-empty">
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptyHint}>No pending friend requests.</Text>
        </View>
      )}

      {state.status === 'success' && sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FriendRequestCard
              request={item}
              onAccept={acceptRequest}
              onReject={rejectRequest}
              onCancel={cancelOutgoing}
              testID={`request-card-${item.id}`}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title as string}</Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="requests-list"
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
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
  listContent: { paddingBottom: spacing.xl },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyHint: { color: colors.textMuted, fontSize: 13 },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
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
