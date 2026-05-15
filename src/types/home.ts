export interface PublicUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Challenge {
  id: string;
  title: string;
  game: string;
  gameBg: string; // hex color for the card background
  platform: string; // e.g. 'PS5', 'Xbox', 'PC', 'Cross-Platform'
  entryFee: number;
  prize: number;
  currency: string;
  participantCount: number;
  maxParticipants: number;
  status: 'open' | 'live' | 'ended';
  host: PublicUser;
  expiresAt: string;
  isFeatured: boolean;
  isHot: boolean;
}

export interface LiveStream {
  id: string;
  title: string;
  game: string;
  gameBg: string;
  gameAccent: string;
  platform: string; // e.g. 'PS5', 'Xbox', 'PC'
  potentialWin: number; // prize pool for the ongoing match/challenge
  currency: string;
  host: PublicUser;
  viewerCount: number;
  likeCount: number;
  isLiked: boolean;
  isLive: boolean;
  startedAt: string;
}

export interface Shortcut {
  id: string;
  label: string;
  icon: string; // svg key
  screen: string;
}

export interface Notification {
  id: string;
  type: 'challenge' | 'friend' | 'result' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actorUser?: PublicUser;
}

export interface HomeData {
  walletBalance: number;
  walletCurrency: string;
  notificationCount: number;
  featuredChallenges: Challenge[];
  hotChallenges: Challenge[];
  streams: LiveStream[];
}

export type SearchResultType = 'player' | 'challenge' | 'tournament' | 'stream' | 'game';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  avatarUrl?: string;
  gameBg?: string;
}

export interface GroupedSearchResults {
  players: SearchResult[];
  challenges: SearchResult[];
  tournaments: SearchResult[];
  streams: SearchResult[];
  games: SearchResult[];
}
