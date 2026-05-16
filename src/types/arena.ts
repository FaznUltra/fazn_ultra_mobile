import type { PublicUser } from './home';

export type ChallengeStatus =
  | 'open'
  | 'pending_acceptance'
  | 'accepted'
  | 'live'
  | 'awaiting_result'
  | 'disputed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired'
  | 'void'
  | 'refunded';

export type ChallengeOutcome = 'win' | 'loss' | 'draw' | null;
export type UserRole = 'creator' | 'opponent' | 'spectator';

export interface ArenaChallenge {
  id: string;
  title: string;
  game: string;
  gameBg: string; // hex
  platform: string; // 'PS5' | 'Xbox' | 'PC' | 'Cross-Platform' | 'Mobile'
  format: string; // '1v1' | '2v2' | 'Tournament'
  stake: number; // Naira — each player puts this in
  potentialWin: number; // Naira — what winner takes (stake × 2 minus platform fee)
  platformFee: number; // Naira — FAZN's cut
  currency: '₦';
  status: ChallengeStatus;
  creator: PublicUser;
  opponent: PublicUser | null; // null when open
  userRole: UserRole; // current user's role in this challenge
  outcome: ChallengeOutcome; // only set when completed
  acceptanceDue: string; // ISO — deadline to accept
  gameStartTime: string; // ISO — when the match begins
  gameEndTime: string | null; // ISO — when match ended (null if not started)
  resultSubmittedBy: string[]; // userIds who submitted results
  createdAt: string;
  rules: string; // free text rules/notes
  inviteOnly: boolean; // false = anyone can join, true = specific invite
}

export interface ArenaData {
  marketplace: ArenaChallenge[]; // open challenges user can join
  myChallenges: ArenaChallenge[]; // all user's challenges
  invited: ArenaChallenge[]; // pending_acceptance where user is opponent
}
