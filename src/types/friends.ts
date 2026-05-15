export type OnlineStatus = 'online' | 'in_game' | 'offline';
export type FriendshipStatus =
  | 'friends'
  | 'pending_sent'
  | 'pending_received'
  | 'blocked'
  | 'none';

export interface FriendUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  currentGame?: string; // only when in_game
  isFavourite: boolean;
  friendshipStatus: FriendshipStatus;
  mutualFriendsCount?: number;
}

export interface FriendRequest {
  id: string;
  user: FriendUser;
  sentAt: string; // ISO
  direction: 'incoming' | 'outgoing';
}

export interface FriendsState {
  friends: FriendUser[];
  suggestions: FriendUser[]; // friends of friends for Discover tab
  requestCount: number; // incoming pending count
}
