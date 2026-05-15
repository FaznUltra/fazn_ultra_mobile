import { useState, useEffect, useCallback } from 'react';
import type { FriendUser, FriendRequest, FriendsState } from '../types/friends';

/**
 * Mock data — shape defines the backend contract.
 * Backend: GET /api/v1/friends → { friends, suggestions, requestCount }
 */
const MOCK_FRIENDS: FriendUser[] = [
  {
    id: 'u1',
    username: 'kingjames23',
    firstName: 'LeBron',
    lastName: 'James',
    onlineStatus: 'in_game',
    currentGame: 'EA FC 25',
    isFavourite: true,
    friendshipStatus: 'friends',
  },
  {
    id: 'u2',
    username: 'techboss_uk',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    onlineStatus: 'online',
    isFavourite: false,
    friendshipStatus: 'friends',
  },
  {
    id: 'u3',
    username: 'sniperghost',
    firstName: 'Marcus',
    lastName: 'Webb',
    onlineStatus: 'in_game',
    currentGame: 'Call of Duty',
    isFavourite: false,
    friendshipStatus: 'friends',
  },
  {
    id: 'u4',
    username: 'j_buckets',
    firstName: 'Jerome',
    lastName: 'Thompson',
    onlineStatus: 'in_game',
    currentGame: 'NBA 2K25',
    isFavourite: true,
    friendshipStatus: 'friends',
  },
  {
    id: 'u5',
    username: 'pixel_war',
    firstName: 'Amy',
    lastName: 'Chen',
    onlineStatus: 'offline',
    isFavourite: true,
    friendshipStatus: 'friends',
  },
  {
    id: 'u6',
    username: 'nova_player',
    firstName: 'Priya',
    lastName: 'Sharma',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'friends',
  },
  {
    id: 'u7',
    username: 'theace_of',
    firstName: 'Carlos',
    lastName: 'Rivera',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'friends',
  },
  {
    id: 'u8',
    username: 'darkwave99',
    firstName: 'David',
    lastName: 'Okonkwo',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'friends',
  },
];

const MOCK_SUGGESTIONS: FriendUser[] = [
  {
    id: 's1',
    username: 'grindset_x',
    firstName: 'Fatima',
    lastName: 'Al-Hassan',
    onlineStatus: 'online',
    isFavourite: false,
    friendshipStatus: 'none',
    mutualFriendsCount: 4,
  },
  {
    id: 's2',
    username: 'realmadrid_fan',
    firstName: 'Luis',
    lastName: 'Santos',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'none',
    mutualFriendsCount: 2,
  },
  {
    id: 's3',
    username: 'arena_warrior',
    firstName: 'Chloe',
    lastName: 'Dubois',
    onlineStatus: 'in_game',
    currentGame: 'EA FC 25',
    isFavourite: false,
    friendshipStatus: 'pending_sent',
    mutualFriendsCount: 3,
  },
  {
    id: 's4',
    username: 'gold_hunter',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'none',
    mutualFriendsCount: 1,
  },
];

const MOCK_REQUESTS: FriendRequest[] = [
  {
    id: 'req1',
    user: {
      id: 'r1',
      username: 'warzone_king',
      firstName: 'Alex',
      lastName: 'Brown',
      onlineStatus: 'online',
      isFavourite: false,
      friendshipStatus: 'pending_received',
      mutualFriendsCount: 2,
    },
    sentAt: '2026-05-14T10:00:00Z',
    direction: 'incoming',
  },
  {
    id: 'req2',
    user: {
      id: 'r2',
      username: 'fcmaster_pro',
      firstName: 'Yuki',
      lastName: 'Tanaka',
      onlineStatus: 'offline',
      isFavourite: false,
      friendshipStatus: 'pending_received',
      mutualFriendsCount: 1,
    },
    sentAt: '2026-05-13T18:30:00Z',
    direction: 'incoming',
  },
  {
    id: 'req3',
    user: {
      id: 'r3',
      username: 'pro_gamer_x',
      firstName: 'Samuel',
      lastName: 'Osei',
      onlineStatus: 'in_game',
      currentGame: 'NBA 2K25',
      isFavourite: false,
      friendshipStatus: 'pending_sent',
    },
    sentAt: '2026-05-12T09:00:00Z',
    direction: 'outgoing',
  },
  {
    id: 'req4',
    user: {
      id: 'r4',
      username: 'speedy_striker',
      firstName: 'Maya',
      lastName: 'Johnson',
      onlineStatus: 'offline',
      isFavourite: false,
      friendshipStatus: 'pending_sent',
    },
    sentAt: '2026-05-11T14:00:00Z',
    direction: 'outgoing',
  },
];

async function fetchFriends(): Promise<FriendsState> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    friends: MOCK_FRIENDS,
    suggestions: MOCK_SUGGESTIONS,
    requestCount: MOCK_REQUESTS.filter((r) => r.direction === 'incoming').length,
  };
}

async function fetchRequests(): Promise<FriendRequest[]> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_REQUESTS;
}

type FriendsLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FriendsState }
  | { status: 'error'; message: string };

type RequestsLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FriendRequest[] }
  | { status: 'error'; message: string };

export function useFriends() {
  const [state, setState] = useState<FriendsLoadState>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchFriends();
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', message: 'Failed to load friends. Tap to retry.' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleFavourite = useCallback(
    (userId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: {
          ...state.data,
          friends: state.data.friends.map((f) =>
            f.id === userId ? { ...f, isFavourite: !f.isFavourite } : f,
          ),
        },
      });
    },
    [state],
  );

  const unfriend = useCallback(
    (userId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: {
          ...state.data,
          friends: state.data.friends.filter((f) => f.id !== userId),
        },
      });
    },
    [state],
  );

  const sendRequest = useCallback(
    (userId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: {
          ...state.data,
          suggestions: state.data.suggestions.map((s) =>
            s.id === userId ? { ...s, friendshipStatus: 'pending_sent' } : s,
          ),
        },
      });
    },
    [state],
  );

  const cancelRequest = useCallback(
    (userId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: {
          ...state.data,
          suggestions: state.data.suggestions.map((s) =>
            s.id === userId ? { ...s, friendshipStatus: 'none' } : s,
          ),
        },
      });
    },
    [state],
  );

  return { state, retry: load, toggleFavourite, unfriend, sendRequest, cancelRequest };
}

export function useFriendRequests() {
  const [state, setState] = useState<RequestsLoadState>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchRequests();
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', message: 'Failed to load requests.' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const acceptRequest = useCallback(
    (requestId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: state.data.filter((r) => r.id !== requestId),
      });
    },
    [state],
  );

  const rejectRequest = useCallback(
    (requestId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: state.data.filter((r) => r.id !== requestId),
      });
    },
    [state],
  );

  const cancelOutgoing = useCallback(
    (requestId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: state.data.filter((r) => r.id !== requestId),
      });
    },
    [state],
  );

  return { state, retry: load, acceptRequest, rejectRequest, cancelOutgoing };
}
