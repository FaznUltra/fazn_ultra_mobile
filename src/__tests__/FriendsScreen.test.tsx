import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { FriendsScreen } from '../screens/app/friends/FriendsScreen';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
    Rect: m('rect'),
    Line: m('line'),
  };
});

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn(), canGoBack: () => true };

// ─── useFriends mock ──────────────────────────────────────────────────────────

const mockToggleFavourite = jest.fn();
const mockUnfriend = jest.fn();
const mockSendRequest = jest.fn();
const mockCancelRequest = jest.fn();
const mockRetry = jest.fn();

let mockFriendsState: object = { status: 'loading' };

jest.mock('../hooks/useFriends', () => ({
  useFriends: () => ({
    state: mockFriendsState,
    retry: mockRetry,
    toggleFavourite: mockToggleFavourite,
    unfriend: mockUnfriend,
    sendRequest: mockSendRequest,
    cancelRequest: mockCancelRequest,
  }),
  useFriendRequests: () => ({
    state: { status: 'loading' },
    retry: jest.fn(),
    acceptRequest: jest.fn(),
    rejectRequest: jest.fn(),
    cancelOutgoing: jest.fn(),
  }),
}));

const successState = {
  status: 'success',
  data: {
    requestCount: 2,
    friends: [
      {
        id: 'u1',
        username: 'kingjames23',
        firstName: 'LeBron',
        lastName: 'James',
        onlineStatus: 'in_game',
        currentGame: 'EA FC 25',
        isFavourite: true,
        friendshipStatus: 'friends',
      },
      {
        id: 'u2',
        username: 'techboss_uk',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        onlineStatus: 'online',
        isFavourite: false,
        friendshipStatus: 'friends',
      },
      {
        id: 'u3',
        username: 'darkwave99',
        firstName: 'David',
        lastName: 'Okonkwo',
        onlineStatus: 'offline',
        isFavourite: false,
        friendshipStatus: 'friends',
      },
    ],
    suggestions: [
      {
        id: 's1',
        username: 'grindset_x',
        firstName: 'Fatima',
        lastName: 'Al-Hassan',
        onlineStatus: 'online',
        isFavourite: false,
        friendshipStatus: 'none',
        mutualFriendsCount: 4,
      },
    ],
  },
};

const renderScreen = (state = successState) => {
  mockFriendsState = state;
  return render(<FriendsScreen navigation={mockNavigation as never} route={{} as never} />);
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FriendsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows skeleton while loading', () => {
    mockFriendsState = { status: 'loading' };
    const { getByTestId } = render(
      <FriendsScreen navigation={mockNavigation as never} route={{} as never} />,
    );
    expect(getByTestId('friends-skeleton')).toBeTruthy();
  });

  it('renders screen root', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('friends-screen')).toBeTruthy();
  });

  it('renders three tab pills', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('tab-pill-friends')).toBeTruthy();
    expect(getByTestId('tab-pill-favourites')).toBeTruthy();
    expect(getByTestId('tab-pill-discover')).toBeTruthy();
  });

  it('renders friends list on friends tab', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('friends-list')).toBeTruthy();
    expect(getByTestId('friend-card-u1')).toBeTruthy();
    expect(getByTestId('friend-card-u2')).toBeTruthy();
  });

  it('switches to favourites tab and shows favourited friends', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('tab-pill-favourites'));
    expect(getByTestId('favourites-list')).toBeTruthy();
    expect(getByTestId('favourite-card-u1')).toBeTruthy();
  });

  it('shows empty state on favourites when no favourites', () => {
    const stateNoFavs = {
      ...successState,
      data: {
        ...successState.data,
        friends: successState.data.friends.map((f) => ({ ...f, isFavourite: false })),
      },
    };
    const { getByTestId, getByText } = renderScreen(stateNoFavs);
    fireEvent.press(getByTestId('tab-pill-favourites'));
    expect(getByText('No favourites yet')).toBeTruthy();
  });

  it('switches to discover tab and shows suggestions', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('tab-pill-discover'));
    expect(getByTestId('discover-list')).toBeTruthy();
    expect(getByTestId('discover-card-s1')).toBeTruthy();
  });

  it('navigates to search screen on search press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('friends-search-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('FriendSearch');
  });

  it('navigates to requests screen on bell press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('friends-requests-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('FriendRequests');
  });

  it('shows error state with retry', () => {
    const { getByTestId } = renderScreen({ status: 'error', message: 'Network error' });
    expect(getByTestId('friends-error')).toBeTruthy();
    expect(getByTestId('friends-retry')).toBeTruthy();
  });

  it('calls retry on retry press', () => {
    const { getByTestId } = renderScreen({ status: 'error', message: 'error' });
    fireEvent.press(getByTestId('friends-retry'));
    expect(mockRetry).toHaveBeenCalled();
  });

  it('calls toggleFavourite when star pressed', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('friend-favourite-u1'));
    expect(mockToggleFavourite).toHaveBeenCalledWith('u1');
  });

  it('shows empty state when no friends', () => {
    const { getByText } = renderScreen({
      status: 'success',
      data: { ...successState.data, friends: [] },
    });
    expect(getByText('No friends yet')).toBeTruthy();
  });

  it('shows empty state when no discover suggestions', () => {
    const { getByTestId, getByText } = renderScreen({
      status: 'success',
      data: { ...successState.data, suggestions: [] },
    });
    fireEvent.press(getByTestId('tab-pill-discover'));
    expect(getByText('No suggestions right now')).toBeTruthy();
  });
});
