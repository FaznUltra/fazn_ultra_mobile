import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

export type TabParamList = {
  Home: undefined;
  Arena: undefined;
  Create: undefined;
  Friends: undefined;
  Profile: undefined;
};

/** Each tab root stack — sub-screens within a tab go here */
export type HomeStackParamList = {
  HomeMain: undefined;
  GlobalSearch: undefined;
  Notifications: undefined;
  UserPublicProfile: { userId: string; username: string };
  ChallengeDetail: { challengeId: string };
  StreamDetail: { streamId: string };
  WalletMain: undefined;
  AddFunds: { preselectedAmount?: number };
  Withdraw: undefined;
  Transactions: undefined;
};

export type WalletStackParamList = {
  WalletMain: undefined;
  AddFunds: { preselectedAmount?: number };
  Withdraw: undefined;
  Transactions: undefined;
};
export type ArenaStackParamList = { ArenaMain: undefined };
export type FriendsStackParamList = {
  FriendsList: undefined;
  FriendSearch: undefined;
  FriendRequests: undefined;
};
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Privacy: undefined;
  Settings: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<Record<string, undefined>>
>;
