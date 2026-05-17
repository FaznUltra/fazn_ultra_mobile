import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../../../screens/app/home/HomeScreen';
import type { HomeData } from '../../../types/home';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('../../../hooks/useWallet', () => ({
  useWallet: () => ({
    state: { status: 'success', data: { balance: 12500 } },
    refreshWallet: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => {
    const { View } = require('react-native');
    const mockReact = require('react');
    return mockReact.createElement(View, { testID }, children);
  },
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-svg', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const m = (n: string) => (p: object) =>
    mockReact.createElement(View, { testID: `svg-${n}`, ...p });
  return {
    __esModule: true,
    default: m('svg'),
    Svg: m('svg'),
    Path: m('path'),
    Circle: m('circle'),
    Rect: m('rect'),
    Line: m('line'),
    Polyline: m('polyline'),
  };
});

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

let mockState: object = { status: 'loading' };
const mockRetry = jest.fn();
const mockLikeStream = jest.fn();

jest.mock('../../../hooks/useHome', () => ({
  useHome: () => ({
    state: mockState,
    retry: mockRetry,
    likeStream: mockLikeStream,
  }),
}));

const DATA: HomeData = {
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
  ],
  streams: [
    {
      id: 'ls1',
      title: 'Road to Diamond',
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
  ],
};

const renderScreen = () =>
  render(
    <HomeScreen navigation={mockNavigation as never} route={{} as never} />,
  );

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { status: 'loading' };
  });

  it('renders skeleton while loading', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('home-skeleton')).toBeTruthy();
  });

  it('renders error state with retry', () => {
    mockState = { status: 'error', message: 'Failed to load feed.' };
    const { getByTestId } = renderScreen();
    expect(getByTestId('home-error')).toBeTruthy();
    expect(getByTestId('home-retry')).toBeTruthy();
  });

  it('renders streams list on success', () => {
    mockState = { status: 'success', data: DATA };
    const { getByTestId } = renderScreen();
    expect(getByTestId('home-screen')).toBeTruthy();
    expect(getByTestId('home-streams-list')).toBeTruthy();
    expect(getByTestId('home-featured-list')).toBeTruthy();
    expect(getByTestId('home-hot-list')).toBeTruthy();
  });
});
