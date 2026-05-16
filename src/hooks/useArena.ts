import { useState, useEffect, useCallback } from 'react';
import type { PublicUser } from '../types/home';
import type {
  ArenaData,
  ArenaChallenge,
  ChallengeOutcome,
} from '../types/arena';

/**
 * Mock data — shape defines the backend contract.
 * Backend: GET /api/v1/arena → ArenaData
 *
 * Mutations (optimistic, local-only for now):
 * - POST /api/v1/arena/:id/accept
 * - POST /api/v1/arena/:id/reject
 * - POST /api/v1/arena/:id/cancel
 * - POST /api/v1/arena/:id/result   { outcome }
 */

const ME: PublicUser = {
  id: 'u1',
  username: 'kingjames23',
  firstName: 'LeBron',
  lastName: 'James',
};

const SNIPER: PublicUser = {
  id: 'u3',
  username: 'sniperghost',
  firstName: 'Marcus',
  lastName: 'Webb',
};
const NOVA: PublicUser = {
  id: 'u5',
  username: 'nova_player',
  firstName: 'Priya',
  lastName: 'Sharma',
};
const BUCKETS: PublicUser = {
  id: 'u4',
  username: 'j_buckets',
  firstName: 'Jerome',
  lastName: 'Thompson',
};
const TECHBOSS: PublicUser = {
  id: 'u2',
  username: 'techboss_uk',
  firstName: 'Sarah',
  lastName: 'Mitchell',
};

const FEE_RATE = 0.05;
const win = (stake: number) => Math.round(stake * 2 * (1 - FEE_RATE));
const fee = (stake: number) => Math.round(stake * 2 * FEE_RATE);

// Anchor relative times off "now" so the UI stays realistic across days.
const NOW = Date.now();
const mins = (m: number) => new Date(NOW + m * 60_000).toISOString();
const hrs = (h: number) => new Date(NOW + h * 3_600_000).toISOString();
const days = (d: number) => new Date(NOW + d * 86_400_000).toISOString();

function build(): ArenaData {
  const marketplace: ArenaChallenge[] = [
    {
      id: 'm1',
      title: 'EA FC 25 — Quick 1v1',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 2000,
      potentialWin: win(2000),
      platformFee: fee(2000),
      currency: '₦',
      status: 'open',
      creator: SNIPER,
      opponent: null,
      userRole: 'spectator',
      outcome: null,
      acceptanceDue: hrs(2),
      gameStartTime: hrs(4),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: hrs(-1),
      rules: 'Best of 1. 6-minute halves. No custom formations.',
      inviteOnly: false,
    },
    {
      id: 'm2',
      title: 'Call of Duty — Search & Destroy',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      format: '1v1',
      stake: 5000,
      potentialWin: win(5000),
      platformFee: fee(5000),
      currency: '₦',
      status: 'open',
      creator: NOVA,
      opponent: null,
      userRole: 'spectator',
      outcome: null,
      acceptanceDue: mins(30),
      gameStartTime: days(1),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: hrs(-2),
      rules: 'First to 6 rounds. Standard ruleset, no shotguns.',
      inviteOnly: false,
    },
    {
      id: 'm3',
      title: 'NBA 2K25 — Park Run',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      platform: 'Xbox',
      format: '1v1',
      stake: 1000,
      potentialWin: win(1000),
      platformFee: fee(1000),
      currency: '₦',
      status: 'open',
      creator: BUCKETS,
      opponent: null,
      userRole: 'spectator',
      outcome: null,
      acceptanceDue: hrs(6),
      gameStartTime: hrs(8),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: hrs(-3),
      rules: '5-minute quarters. All-Star difficulty.',
      inviteOnly: false,
    },
    {
      id: 'm4',
      title: 'Mortal Kombat 1 — FT5',
      game: 'Mortal Kombat',
      gameBg: '#7c1d1d',
      platform: 'PS5',
      format: '1v1',
      stake: 10000,
      potentialWin: win(10000),
      platformFee: fee(10000),
      currency: '₦',
      status: 'open',
      creator: TECHBOSS,
      opponent: null,
      userRole: 'spectator',
      outcome: null,
      acceptanceDue: hrs(1),
      gameStartTime: hrs(3),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: hrs(-4),
      rules: 'First to 5. No Kameo bans. Tournament variations only.',
      inviteOnly: false,
    },
  ];

  const myChallenges: ArenaChallenge[] = [
    {
      id: 'b1',
      title: 'EA FC 25 — Ranked Duel',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 3000,
      potentialWin: win(3000),
      platformFee: fee(3000),
      currency: '₦',
      status: 'accepted',
      creator: ME,
      opponent: SNIPER,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: hrs(-1),
      gameStartTime: hrs(2),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: hrs(-5),
      rules: '6-minute halves. Legendary difficulty.',
      inviteOnly: false,
    },
    {
      id: 'b2',
      title: 'Call of Duty — 1v1 Showdown',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      format: '1v1',
      stake: 5000,
      potentialWin: win(5000),
      platformFee: fee(5000),
      currency: '₦',
      status: 'live',
      creator: ME,
      opponent: NOVA,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: hrs(-3),
      gameStartTime: mins(-20),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: hrs(-6),
      rules: 'First to 6 rounds. Best of 11.',
      inviteOnly: false,
    },
    {
      id: 'b3',
      title: 'NBA 2K25 — Buzzer Beater',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      platform: 'Xbox',
      format: '1v1',
      stake: 2000,
      potentialWin: win(2000),
      platformFee: fee(2000),
      currency: '₦',
      status: 'awaiting_result',
      creator: ME,
      opponent: BUCKETS,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: hrs(-5),
      gameStartTime: hrs(-1),
      gameEndTime: mins(-15),
      resultSubmittedBy: [],
      createdAt: hrs(-7),
      rules: '5-minute quarters. Hall of Fame difficulty.',
      inviteOnly: false,
    },
    {
      id: 'b4',
      title: 'Mortal Kombat 1 — Money Match',
      game: 'Mortal Kombat',
      gameBg: '#7c1d1d',
      platform: 'PS5',
      format: '1v1',
      stake: 8000,
      potentialWin: win(8000),
      platformFee: fee(8000),
      currency: '₦',
      status: 'disputed',
      creator: ME,
      opponent: TECHBOSS,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: hrs(-8),
      gameStartTime: hrs(-3),
      gameEndTime: hrs(-2),
      resultSubmittedBy: ['u1', 'u2'],
      createdAt: hrs(-9),
      rules: 'First to 5. Result screenshots required.',
      inviteOnly: false,
    },
    {
      id: 'b5',
      title: 'EA FC 25 — Grudge Match',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 5000,
      potentialWin: win(5000),
      platformFee: fee(5000),
      currency: '₦',
      status: 'completed',
      creator: ME,
      opponent: NOVA,
      userRole: 'creator',
      outcome: 'win',
      acceptanceDue: days(-1),
      gameStartTime: days(-1),
      gameEndTime: days(-1),
      resultSubmittedBy: ['u1', 'u5'],
      createdAt: days(-1),
      rules: '6-minute halves.',
      inviteOnly: false,
    },
    {
      id: 'b6',
      title: 'Call of Duty — Rematch',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      format: '1v1',
      stake: 5000,
      potentialWin: win(5000),
      platformFee: fee(5000),
      currency: '₦',
      status: 'completed',
      creator: ME,
      opponent: SNIPER,
      userRole: 'creator',
      outcome: 'loss',
      acceptanceDue: days(-2),
      gameStartTime: days(-2),
      gameEndTime: days(-2),
      resultSubmittedBy: ['u1', 'u3'],
      createdAt: days(-2),
      rules: 'First to 6 rounds.',
      inviteOnly: false,
    },
    {
      id: 'b7',
      title: 'NBA 2K25 — Even Game',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      platform: 'Xbox',
      format: '1v1',
      stake: 1000,
      potentialWin: win(1000),
      platformFee: fee(1000),
      currency: '₦',
      status: 'completed',
      creator: ME,
      opponent: BUCKETS,
      userRole: 'creator',
      outcome: 'draw',
      acceptanceDue: days(-3),
      gameStartTime: days(-3),
      gameEndTime: days(-3),
      resultSubmittedBy: ['u1', 'u4'],
      createdAt: days(-3),
      rules: '5-minute quarters. Stake refunded on draw.',
      inviteOnly: false,
    },
    {
      id: 'b8',
      title: 'Mortal Kombat 1 — Cancelled',
      game: 'Mortal Kombat',
      gameBg: '#7c1d1d',
      platform: 'PS5',
      format: '1v1',
      stake: 4000,
      potentialWin: win(4000),
      platformFee: fee(4000),
      currency: '₦',
      status: 'cancelled',
      creator: ME,
      opponent: null,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: days(-4),
      gameStartTime: days(-4),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: days(-4),
      rules: 'First to 5.',
      inviteOnly: false,
    },
    {
      id: 'b9',
      title: 'EA FC 25 — Expired Listing',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 2500,
      potentialWin: win(2500),
      platformFee: fee(2500),
      currency: '₦',
      status: 'expired',
      creator: ME,
      opponent: null,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: days(-5),
      gameStartTime: days(-5),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: days(-5),
      rules: '6-minute halves.',
      inviteOnly: false,
    },
    {
      id: 'b10',
      title: 'Call of Duty — Voided Match',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      format: '1v1',
      stake: 6000,
      potentialWin: win(6000),
      platformFee: fee(6000),
      currency: '₦',
      status: 'void',
      creator: ME,
      opponent: TECHBOSS,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: days(-6),
      gameStartTime: days(-6),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: days(-6),
      rules: 'Voided by admin — connection issues unresolved.',
      inviteOnly: false,
    },
    {
      id: 'b11',
      title: 'NBA 2K25 — Refunded',
      game: 'NBA 2K25',
      gameBg: '#7c2d12',
      platform: 'Xbox',
      format: '1v1',
      stake: 3000,
      potentialWin: win(3000),
      platformFee: fee(3000),
      currency: '₦',
      status: 'refunded',
      creator: ME,
      opponent: BUCKETS,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: days(-6),
      gameStartTime: days(-6),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: days(-6),
      rules: 'Stake returned to both players after void.',
      inviteOnly: false,
    },
  ];

  const invited: ArenaChallenge[] = [
    {
      id: 'i1',
      title: 'EA FC 25 — You vs techboss_uk',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 3000,
      potentialWin: win(3000),
      platformFee: fee(3000),
      currency: '₦',
      status: 'pending_acceptance',
      creator: TECHBOSS,
      opponent: ME,
      userRole: 'opponent',
      outcome: null,
      acceptanceDue: hrs(1),
      gameStartTime: hrs(5),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: mins(-30),
      rules: '6-minute halves. Legendary difficulty.',
      inviteOnly: true,
    },
    {
      id: 'i2',
      title: 'Call of Duty — You vs j_buckets',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      format: '1v1',
      stake: 7500,
      potentialWin: win(7500),
      platformFee: fee(7500),
      currency: '₦',
      status: 'pending_acceptance',
      creator: BUCKETS,
      opponent: ME,
      userRole: 'opponent',
      outcome: null,
      acceptanceDue: hrs(3),
      gameStartTime: hrs(6),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: mins(-45),
      rules: 'First to 6 rounds. Best of 11.',
      inviteOnly: true,
    },
  ];

  return { marketplace, myChallenges, invited };
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ArenaData }
  | { status: 'error'; message: string };

async function fetchArena(): Promise<ArenaData> {
  await new Promise((r) => setTimeout(r, 900));
  return build();
}

export function useArena() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchArena();
      setState({ status: 'success', data });
    } catch {
      setState({
        status: 'error',
        message: 'Failed to load the Arena. Tap to retry.',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const acceptInvite = useCallback((challengeId: string) => {
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      const target = prev.data.invited.find((c) => c.id === challengeId);
      if (!target) return prev;
      const accepted: ArenaChallenge = { ...target, status: 'accepted' };
      return {
        status: 'success',
        data: {
          ...prev.data,
          invited: prev.data.invited.filter((c) => c.id !== challengeId),
          myChallenges: [accepted, ...prev.data.myChallenges],
        },
      };
    });
  }, []);

  const rejectInvite = useCallback((challengeId: string) => {
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      const target = prev.data.invited.find((c) => c.id === challengeId);
      if (!target) return prev;
      const rejected: ArenaChallenge = { ...target, status: 'rejected' };
      return {
        status: 'success',
        data: {
          ...prev.data,
          invited: prev.data.invited.filter((c) => c.id !== challengeId),
          myChallenges: [rejected, ...prev.data.myChallenges],
        },
      };
    });
  }, []);

  const cancelChallenge = useCallback((challengeId: string) => {
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      return {
        status: 'success',
        data: {
          ...prev.data,
          marketplace: prev.data.marketplace.filter(
            (c) => c.id !== challengeId,
          ),
          myChallenges: prev.data.myChallenges.map((c) =>
            c.id === challengeId ? { ...c, status: 'cancelled' } : c,
          ),
        },
      };
    });
  }, []);

  const submitResult = useCallback(
    (challengeId: string, outcome: Exclude<ChallengeOutcome, null>) => {
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        return {
          status: 'success',
          data: {
            ...prev.data,
            myChallenges: prev.data.myChallenges.map((c) =>
              c.id === challengeId
                ? {
                    ...c,
                    status: 'completed',
                    outcome,
                    resultSubmittedBy: Array.from(
                      new Set([...c.resultSubmittedBy, ME.id]),
                    ),
                  }
                : c,
            ),
          },
        };
      });
    },
    [],
  );

  return {
    state,
    acceptInvite,
    rejectInvite,
    cancelChallenge,
    submitResult,
    refresh: load,
  };
}
