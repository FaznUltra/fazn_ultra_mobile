import { useState, useEffect, useCallback } from 'react';
import type { ProfileData } from '../types/profile';

/**
 * Mock profile data. Replace the `fetchProfile` body with a real API call
 * once the backend exposes GET /api/v1/profile/me.
 *
 * Shape contract for backend:
 * GET /api/v1/profile/me
 * Response: { stats, gameRankings, recentResults, highestWin, topRival }
 */
async function fetchProfile(): Promise<ProfileData> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1000));

  return {
    stats: {
      globalRank: 247,
      totalWins: 34,
      totalMatches: 51,
      winRate: 67,
    },
    gameRankings: [
      {
        gameId: 'fc25',
        gameName: 'EA FC 25',
        platform: 'PS5',
        tier: 'Gold',
        rank: 124,
        points: 2840,
      },
      {
        gameId: 'cod',
        gameName: 'Call of Duty',
        platform: 'PS5',
        tier: 'Silver',
        rank: 891,
        points: 1530,
      },
      {
        gameId: 'nba2k',
        gameName: 'NBA 2K25',
        platform: 'Xbox',
        tier: 'Platinum',
        rank: 56,
        points: 4120,
      },
    ],
    recentResults: [
      {
        id: 'r1',
        gameName: 'EA FC 25',
        outcome: 'win',
        score: '3 – 1',
        opponentUsername: 'rival_king',
        playedAt: '2026-05-14T18:30:00Z',
      },
      {
        id: 'r2',
        gameName: 'Call of Duty',
        outcome: 'loss',
        score: '12 – 18',
        opponentUsername: 'sniperGhost',
        playedAt: '2026-05-13T20:00:00Z',
      },
      {
        id: 'r3',
        gameName: 'NBA 2K25',
        outcome: 'win',
        score: '98 – 84',
        opponentUsername: 'buckets_06',
        playedAt: '2026-05-12T17:00:00Z',
      },
      {
        id: 'r4',
        gameName: 'EA FC 25',
        outcome: 'win',
        score: '2 – 0',
        opponentUsername: 'the_tactician',
        playedAt: '2026-05-11T15:30:00Z',
      },
      {
        id: 'r5',
        gameName: 'Call of Duty',
        outcome: 'draw',
        score: '15 – 15',
        opponentUsername: 'warzone_x',
        playedAt: '2026-05-10T21:00:00Z',
      },
    ],
    highestWin: {
      gameName: 'NBA 2K25',
      score: '128 – 72',
      opponentUsername: 'bench_warmer',
      date: '2026-04-28T16:00:00Z',
    },
    topRival: {
      username: 'rival_king',
      avatarUrl: undefined,
      winsAgainst: 4,
      lossesAgainst: 3,
    },
  };
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ProfileData }
  | { status: 'error'; message: string };

export function useProfile() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchProfile();
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', message: 'Failed to load profile. Tap to retry.' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, retry: load };
}
