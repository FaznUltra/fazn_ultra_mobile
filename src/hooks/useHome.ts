import { useState, useEffect, useCallback } from 'react';
import type { HomeData } from '../types/home';

/**
 * Mock data — shape defines the backend contract.
 * Backend: GET /api/v1/home → HomeData
 */
const MOCK_HOME: HomeData = {
  walletBalance: 12500,
  walletCurrency: '₦',
  notificationCount: 4,
  featuredChallenges: [
    {
      id: 'fc1',
      title: 'Weekend Warriors Cup',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      entryFee: 500,
      prize: 25000,
      currency: '₦',
      participantCount: 14,
      maxParticipants: 16,
      status: 'open',
      host: { id: 'u1', username: 'kingjames23', firstName: 'LeBron', lastName: 'James' },
      expiresAt: '2026-05-18T18:00:00Z',
      isFeatured: true,
      isHot: false,
    },
    {
      id: 'fc2',
      title: 'COD Warzone Invitational',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      entryFee: 1000,
      prize: 50000,
      currency: '₦',
      participantCount: 28,
      maxParticipants: 32,
      status: 'live',
      host: { id: 'u3', username: 'sniperghost', firstName: 'Marcus', lastName: 'Webb' },
      expiresAt: '2026-05-16T20:00:00Z',
      isFeatured: true,
      isHot: true,
    },
    {
      id: 'fc3',
      title: 'NBA Slam Dunk League',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      platform: 'Xbox',
      entryFee: 750,
      prize: 35000,
      currency: '₦',
      participantCount: 8,
      maxParticipants: 16,
      status: 'open',
      host: { id: 'u4', username: 'j_buckets', firstName: 'Jerome', lastName: 'Thompson' },
      expiresAt: '2026-05-20T15:00:00Z',
      isFeatured: true,
      isHot: false,
    },
  ],
  hotChallenges: [
    {
      id: 'hc1',
      title: 'Quick 1v1',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      entryFee: 200,
      prize: 3000,
      currency: '₦',
      participantCount: 1,
      maxParticipants: 2,
      status: 'open',
      host: { id: 'u2', username: 'techboss_uk', firstName: 'Sarah', lastName: 'Mitchell' },
      expiresAt: '2026-05-15T22:00:00Z',
      isFeatured: false,
      isHot: true,
    },
    {
      id: 'hc2',
      title: 'Ranked Grind',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      entryFee: 500,
      prize: 8000,
      currency: '₦',
      participantCount: 3,
      maxParticipants: 4,
      status: 'open',
      host: { id: 'u3', username: 'sniperghost', firstName: 'Marcus', lastName: 'Webb' },
      expiresAt: '2026-05-16T00:00:00Z',
      isFeatured: false,
      isHot: true,
    },
    {
      id: 'hc3',
      title: '2K Buzzer Beater',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      platform: 'Xbox',
      entryFee: 300,
      prize: 4500,
      currency: '₦',
      participantCount: 1,
      maxParticipants: 2,
      status: 'open',
      host: { id: 'u4', username: 'j_buckets', firstName: 'Jerome', lastName: 'Thompson' },
      expiresAt: '2026-05-15T23:30:00Z',
      isFeatured: false,
      isHot: true,
    },
    {
      id: 'hc4',
      title: 'MK Open Bracket',
      game: 'Mortal Kombat',
      gameBg: '#7c1d1d',
      platform: 'Cross-Platform',
      entryFee: 400,
      prize: 6000,
      currency: '₦',
      participantCount: 6,
      maxParticipants: 8,
      status: 'open',
      host: { id: 'u5', username: 'nova_player', firstName: 'Priya', lastName: 'Sharma' },
      expiresAt: '2026-05-17T19:00:00Z',
      isFeatured: false,
      isHot: true,
    },
  ],
  streams: [
    {
      id: 'ls1',
      title: 'Road to Diamond — Ranked Grind 🔥',
      game: 'EA FC 25',
      gameBg: '#14532d',
      gameAccent: '#4ade80',
      platform: 'PS5',
      potentialWin: 25000,
      currency: '₦',
      host: { id: 'u1', username: 'kingjames23', firstName: 'LeBron', lastName: 'James' },
      viewerCount: 1247,
      likeCount: 834,
      isLiked: false,
      isLive: true,
      startedAt: '2026-05-15T16:00:00Z',
    },
    {
      id: 'ls2',
      title: 'Warzone Solo Domination — Top 10 Streak',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      gameAccent: '#60a5fa',
      platform: 'PC',
      potentialWin: 50000,
      currency: '₦',
      host: { id: 'u3', username: 'sniperghost', firstName: 'Marcus', lastName: 'Webb' },
      viewerCount: 3402,
      likeCount: 2105,
      isLiked: true,
      isLive: true,
      startedAt: '2026-05-15T14:30:00Z',
    },
    {
      id: 'ls3',
      title: 'MyCareer Grind — Building the GOAT',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      gameAccent: '#fb923c',
      platform: 'Xbox',
      potentialWin: 35000,
      currency: '₦',
      host: { id: 'u4', username: 'j_buckets', firstName: 'Jerome', lastName: 'Thompson' },
      viewerCount: 892,
      likeCount: 567,
      isLiked: false,
      isLive: true,
      startedAt: '2026-05-15T17:00:00Z',
    },
    {
      id: 'ls4',
      title: 'Mortal Kombat Tournament Practice — Scorpion Main',
      game: 'Mortal Kombat',
      gameBg: '#7c1d1d',
      gameAccent: '#fbbf24',
      platform: 'PS5',
      potentialWin: 6000,
      currency: '₦',
      host: { id: 'u5', username: 'nova_player', firstName: 'Priya', lastName: 'Sharma' },
      viewerCount: 445,
      likeCount: 298,
      isLiked: false,
      isLive: true,
      startedAt: '2026-05-15T15:30:00Z',
    },
    {
      id: 'ls5',
      title: 'FIFA Ultimate Team Weekend League Push',
      game: 'EA FC 25',
      gameBg: '#064e3b',
      gameAccent: '#34d399',
      platform: 'PC',
      potentialWin: 12000,
      currency: '₦',
      host: { id: 'u2', username: 'techboss_uk', firstName: 'Sarah', lastName: 'Mitchell' },
      viewerCount: 678,
      likeCount: 401,
      isLiked: false,
      isLive: false,
      startedAt: '2026-05-14T20:00:00Z',
    },
  ],
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: HomeData }
  | { status: 'error'; message: string };

async function fetchHome(): Promise<HomeData> {
  await new Promise((r) => setTimeout(r, 900));
  return MOCK_HOME;
}

export function useHome() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchHome();
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', message: 'Failed to load feed. Tap to retry.' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const likeStream = useCallback(
    (streamId: string) => {
      if (state.status !== 'success') return;
      setState({
        ...state,
        data: {
          ...state.data,
          streams: state.data.streams.map((s) =>
            s.id === streamId
              ? {
                  ...s,
                  isLiked: !s.isLiked,
                  likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1,
                }
              : s,
          ),
        },
      });
    },
    [state],
  );

  return { state, retry: load, likeStream };
}
