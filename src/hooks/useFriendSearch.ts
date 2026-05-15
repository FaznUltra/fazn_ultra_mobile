import { useState, useRef, useCallback } from 'react';
import type { FriendUser } from '../types/friends';

/**
 * Mock search — replace with GET /api/v1/users/search?q={query}
 * Response: { users: FriendUser[] }
 */
const SEARCH_POOL: FriendUser[] = [
  {
    id: 'q1',
    username: 'quake_champ',
    firstName: 'Ryan',
    lastName: 'Blake',
    onlineStatus: 'online',
    isFavourite: false,
    friendshipStatus: 'none',
    mutualFriendsCount: 1,
  },
  {
    id: 'q2',
    username: 'queen_striker',
    firstName: 'Ngozi',
    lastName: 'Adeyemi',
    onlineStatus: 'in_game',
    currentGame: 'EA FC 25',
    isFavourite: false,
    friendshipStatus: 'friends',
    mutualFriendsCount: 3,
  },
  {
    id: 'q3',
    username: 'quickshot_99',
    firstName: 'Daniel',
    lastName: 'Park',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'pending_sent',
    mutualFriendsCount: 0,
  },
  {
    id: 'q4',
    username: 'kingjames23',
    firstName: 'LeBron',
    lastName: 'James',
    onlineStatus: 'in_game',
    currentGame: 'EA FC 25',
    isFavourite: true,
    friendshipStatus: 'friends',
  },
  {
    id: 'q5',
    username: 'nova_player',
    firstName: 'Priya',
    lastName: 'Sharma',
    onlineStatus: 'offline',
    isFavourite: false,
    friendshipStatus: 'friends',
  },
];

async function searchUsers(query: string): Promise<FriendUser[]> {
  await new Promise((r) => setTimeout(r, 400));
  const q = query.toLowerCase();
  return SEARCH_POOL.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q),
  );
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: FriendUser[]; query: string }
  | { status: 'error'; message: string };

const DEBOUNCE_MS = 300;
const MIN_CHARS = 3;

export function useFriendSearch() {
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (text.trim().length < MIN_CHARS) {
      setSearchState({ status: 'idle' });
      return;
    }

    setSearchState({ status: 'loading' });

    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(text.trim());
        setSearchState({ status: 'success', results, query: text.trim() });
      } catch {
        setSearchState({ status: 'error', message: 'Search failed. Please try again.' });
      }
    }, DEBOUNCE_MS);
  }, []);

  const updateUserStatus = useCallback(
    (userId: string, status: FriendUser['friendshipStatus']) => {
      if (searchState.status !== 'success') return;
      setSearchState({
        ...searchState,
        results: searchState.results.map((u) =>
          u.id === userId ? { ...u, friendshipStatus: status } : u,
        ),
      });
    },
    [searchState],
  );

  return { query, searchState, handleQueryChange, updateUserStatus };
}
