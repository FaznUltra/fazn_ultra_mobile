import { useState, useRef, useCallback } from 'react';
import type { GroupedSearchResults, SearchResult } from '../types/home';

/** Mock search pool — replace with GET /api/v1/search?q={query} */
const POOL: SearchResult[] = [
  { type: 'player', id: 'p1', title: 'LeBron James', subtitle: '@kingjames23', meta: '3 mutual friends' },
  { type: 'player', id: 'p2', title: 'Marcus Webb', subtitle: '@sniperghost', meta: 'Friends' },
  { type: 'player', id: 'p3', title: 'Sarah Mitchell', subtitle: '@techboss_uk', meta: '1 mutual' },
  { type: 'player', id: 'p4', title: 'Priya Sharma', subtitle: '@nova_player', meta: '' },
  { type: 'challenge', id: 'c1', title: 'Weekend Warriors Cup', subtitle: 'EA FC 25 · ₦25,000 prize', meta: '14/16 joined', gameBg: '#14532d' },
  { type: 'challenge', id: 'c2', title: 'COD Warzone Invitational', subtitle: 'Call of Duty · ₦50,000 prize', meta: '28/32 joined · LIVE', gameBg: '#1e3a5f' },
  { type: 'challenge', id: 'c3', title: 'Quick 1v1', subtitle: 'EA FC 25 · ₦3,000 prize', meta: '1/2 joined', gameBg: '#14532d' },
  { type: 'tournament', id: 't1', title: 'FAZN Grand Cup', subtitle: 'EA FC 25 · 32-player bracket', meta: '₦200,000 pool', gameBg: '#14532d' },
  { type: 'tournament', id: 't2', title: 'Friday Night Warzone', subtitle: 'Call of Duty · 16-player', meta: '₦80,000 pool', gameBg: '#1e3a5f' },
  { type: 'stream', id: 's1', title: 'Road to Diamond — Ranked Grind', subtitle: '@kingjames23 · EA FC 25', meta: '1,247 watching', gameBg: '#14532d' },
  { type: 'stream', id: 's2', title: 'Warzone Solo Domination', subtitle: '@sniperghost · Call of Duty', meta: '3,402 watching', gameBg: '#1e3a5f' },
  { type: 'game', id: 'g1', title: 'EA FC 25', subtitle: '1,240 active players · 56 challenges', meta: '', gameBg: '#14532d' },
  { type: 'game', id: 'g2', title: 'Call of Duty', subtitle: '890 active players · 34 challenges', meta: '', gameBg: '#1e3a5f' },
  { type: 'game', id: 'g3', title: 'NBA 2K25', subtitle: '620 active players · 28 challenges', meta: '', gameBg: '#7c2d12' },
  { type: 'game', id: 'g4', title: 'Mortal Kombat', subtitle: '310 active players · 12 challenges', meta: '', gameBg: '#7c1d1d' },
];

async function search(query: string): Promise<GroupedSearchResults> {
  await new Promise((r) => setTimeout(r, 350));
  const q = query.toLowerCase();
  const matches = POOL.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.meta ?? '').toLowerCase().includes(q),
  );
  return {
    players: matches.filter((m) => m.type === 'player'),
    challenges: matches.filter((m) => m.type === 'challenge'),
    tournaments: matches.filter((m) => m.type === 'tournament'),
    streams: matches.filter((m) => m.type === 'stream'),
    games: matches.filter((m) => m.type === 'game'),
  };
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: GroupedSearchResults; query: string }
  | { status: 'error'; message: string };

const DEBOUNCE_MS = 300;
const MIN_CHARS = 3;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (text.trim().length < MIN_CHARS) {
      setSearchState({ status: 'idle' });
      return;
    }
    setSearchState({ status: 'loading' });
    timerRef.current = setTimeout(async () => {
      try {
        const results = await search(text.trim());
        setSearchState({ status: 'success', results, query: text.trim() });
      } catch {
        setSearchState({ status: 'error', message: 'Search failed. Please try again.' });
      }
    }, DEBOUNCE_MS);
  }, []);

  const totalResults = (results: GroupedSearchResults) =>
    Object.values(results).reduce((acc, arr) => acc + arr.length, 0);

  return { query, searchState, handleQueryChange, totalResults };
}
