import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FriendRequestsScreen } from '../screens/app/friends/FriendRequestsScreen';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => {
    const { View } = require('react-native');
    const mockReact = require('react');
    return mockReact.createElement(View, { testID }, children);
  },
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const m = (n: string) => (p: object) => React.createElement(View, { testID: `svg-${n}`, ...p });
  return {
    __esModule: true,
    default: m('svg'),
    Svg: m('svg'),
    Path: m('path'),
    Circle: m('circle'),
  };
});

const mockGoBack = jest.fn();
const mockNavigation = { navigate: jest.fn(), goBack: mockGoBack, canGoBack: () => true };

const mockAccept = jest.fn();
const mockReject = jest.fn();
const mockCancel = jest.fn();
const mockRetry = jest.fn();

let mockRequestState: object = { status: 'loading' };

jest.mock('../hooks/useFriends', () => ({
  useFriends: () => ({
    state: { status: 'loading' },
    retry: jest.fn(),
    toggleFavourite: jest.fn(),
    unfriend: jest.fn(),
    sendRequest: jest.fn(),
    cancelRequest: jest.fn(),
  }),
  useFriendRequests: () => ({
    state: mockRequestState,
    retry: mockRetry,
    acceptRequest: mockAccept,
    rejectRequest: mockReject,
    cancelOutgoing: mockCancel,
  }),
}));

const sampleRequests = [
  {
    id: 'req1',
    user: {
      id: 'r1',
      username: 'warzone_king',
      firstName: 'Alex',
      lastName: 'Brown',
      onlineStatus: 'online',
      isFavourite: false,
      friendshipStatus: 'pending_received',
      mutualFriendsCount: 2,
    },
    sentAt: '2026-05-14T10:00:00Z',
    direction: 'incoming',
  },
  {
    id: 'req2',
    user: {
      id: 'r2',
      username: 'pro_gamer_x',
      firstName: 'Samuel',
      lastName: 'Osei',
      onlineStatus: 'in_game',
      currentGame: 'NBA 2K25',
      isFavourite: false,
      friendshipStatus: 'pending_sent',
    },
    sentAt: '2026-05-12T09:00:00Z',
    direction: 'outgoing',
  },
];

const renderScreen = (state = { status: 'success', data: sampleRequests }) => {
  mockRequestState = state;
  return render(
    <FriendRequestsScreen navigation={mockNavigation as never} route={{} as never} />,
  );
};

describe('FriendRequestsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the screen', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('friend-requests-screen')).toBeTruthy();
  });

  it('shows skeleton while loading', () => {
    mockRequestState = { status: 'loading' };
    const { getByTestId } = render(
      <FriendRequestsScreen navigation={mockNavigation as never} route={{} as never} />,
    );
    expect(getByTestId('friends-skeleton')).toBeTruthy();
  });

  it('renders requests list', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('requests-list')).toBeTruthy();
  });

  it('renders incoming request card', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('request-card-req1')).toBeTruthy();
    expect(getByTestId('accept-btn-req1')).toBeTruthy();
    expect(getByTestId('reject-btn-req1')).toBeTruthy();
  });

  it('renders outgoing request card', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('request-card-req2')).toBeTruthy();
    expect(getByTestId('cancel-btn-req2')).toBeTruthy();
  });

  it('calls acceptRequest on accept press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('accept-btn-req1'));
    expect(mockAccept).toHaveBeenCalledWith('req1');
  });

  it('calls rejectRequest on reject press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('reject-btn-req1'));
    expect(mockReject).toHaveBeenCalledWith('req1');
  });

  it('calls cancelOutgoing on cancel press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('cancel-btn-req2'));
    expect(mockCancel).toHaveBeenCalledWith('req2');
  });

  it('shows empty state when no requests', () => {
    const { getByTestId } = renderScreen({ status: 'success', data: [] });
    expect(getByTestId('requests-empty')).toBeTruthy();
  });

  it('shows error state', () => {
    const { getByTestId } = renderScreen({ status: 'error', message: 'Failed' } as never);
    expect(getByTestId('requests-error')).toBeTruthy();
    expect(getByTestId('requests-retry')).toBeTruthy();
  });

  it('calls retry on retry press', () => {
    const { getByTestId } = renderScreen({ status: 'error', message: 'error' } as never);
    fireEvent.press(getByTestId('requests-retry'));
    expect(mockRetry).toHaveBeenCalled();
  });

  it('navigates back on back button press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('requests-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
