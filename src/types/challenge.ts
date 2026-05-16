export type OpponentType = 'public' | 'private' | 'direct';

export interface ChallengeSetupData {
  stake: number;
  acceptanceDue: string;
  gameStartTime: string;
  opponentType: OpponentType;
  directOpponentId?: string;
  directOpponentName?: string;
  matchTime?: number;
  penalties?: boolean;
  extraTime?: boolean;
  substitutions?: number;
  teamCondition?: 'excellent' | 'normal' | 'poor';
}
