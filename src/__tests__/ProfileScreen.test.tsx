import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ProfileScreen } from '../screens/app/ProfileScreen';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
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
    Polyline: m('polyline'),
  };
});

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  first_name: 'Jane',
  last_name: 'Doe',
  role: 'player' as const,
  email_verified: true,
  auth_provider: 'local' as const,
};

const mockLogout = jest.fn();

jest.mock('../store/auth.store', () => ({
  useAuthStore: (selector: (s: object) => unknown) =>
    selector({ user: mockUser, logout: mockLogout }),
}));

// Control what useProfile returns per test
let mockProfileState: object = { status: 'loading' };
jest.mock('../hooks/useProfile', () => ({
  useProfile: () => ({ state: mockProfileState, retry: jest.fn() }),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

const successState = {
  status: 'success',
  data: {
    stats: { globalRank: 247, totalWins: 34, totalMatches: 51, winRate: 67 },
    gameRankings: [
      { gameId: 'fc25', gameName: 'EA FC 25', platform: 'PS5', tier: 'Gold', rank: 124, points: 2840 },
    ],
    recentResults: [
      { id: 'r1', gameName: 'EA FC 25', outcome: 'win', score: '3 – 1', opponentUsername: 'rival_king', playedAt: '2026-05-14T18:30:00Z' },
    ],
    highestWin: { gameName: 'NBA 2K25', score: '128 – 72', opponentUsername: 'bench_warmer', date: '2026-04-28T16:00:00Z' },
    topRival: { username: 'rival_king', winsAgainst: 4, lossesAgainst: 3 },
  },
};

describe('ProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows skeleton while loading', () => {
    mockProfileState = { status: 'loading' };
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-skeleton')).toBeTruthy();
  });

  it('renders all sections when data loaded', async () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-header')).toBeTruthy();
    expect(getByTestId('profile-stats')).toBeTruthy();
    expect(getByTestId('profile-rankings')).toBeTruthy();
    expect(getByTestId('profile-highlights')).toBeTruthy();
    expect(getByTestId('profile-results')).toBeTruthy();
    expect(getByTestId('profile-menu')).toBeTruthy();
  });

  it('shows user name and username in header', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-name').props.children).toContain('Jane');
    expect(getByTestId('profile-username').props.children).toContain('testuser');
  });

  it('shows global rank', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-global-rank')).toBeTruthy();
  });

  it('shows error state with retry button', () => {
    mockProfileState = { status: 'error', message: 'Network error' };
    const { getByTestId, getByText } = render(<ProfileScreen />);
    expect(getByTestId('profile-error')).toBeTruthy();
    expect(getByTestId('profile-retry')).toBeTruthy();
    expect(getByText('Network error')).toBeTruthy();
  });

  it('calls logout when sign out pressed', async () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('menu-logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders avatar with initials when no avatarUrl', () => {
    mockProfileState = successState;
    const { getAllByTestId } = render(<ProfileScreen />);
    // Profile avatar + rival avatar both show initials
    expect(getAllByTestId('avatar-initials').length).toBeGreaterThanOrEqual(1);
  });

  it('renders stats: wins, losses, win rate', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('stat-wins')).toBeTruthy();
    expect(getByTestId('stat-losses')).toBeTruthy();
    expect(getByTestId('stat-winrate')).toBeTruthy();
  });

  it('renders game ranking rows', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('ranking-row-fc25')).toBeTruthy();
  });

  it('renders recent result rows', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('result-row-r1')).toBeTruthy();
  });

  it('renders highlight cards', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('highlight-win-card')).toBeTruthy();
    expect(getByTestId('highlight-rival-card')).toBeTruthy();
  });

  it('renders all menu items', () => {
    mockProfileState = successState;
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('menu-wallet')).toBeTruthy();
    expect(getByTestId('menu-fpl')).toBeTruthy();
    expect(getByTestId('menu-privacy')).toBeTruthy();
    expect(getByTestId('menu-settings')).toBeTruthy();
    expect(getByTestId('menu-logout')).toBeTruthy();
  });
});

describe('Avatar', () => {
  it('shows initials JD for Jane Doe', () => {
    mockProfileState = successState;
    const { getAllByTestId } = render(<ProfileScreen />);
    const initialsElements = getAllByTestId('avatar-initials');
    // First avatar-initials is the profile header avatar
    expect(initialsElements[0].props.children).toBe('JD');
  });
});

describe('RecentResults empty state', () => {
  it('shows empty message when no results', () => {
    mockProfileState = {
      ...successState,
      data: { ...(successState as { data: object }).data, recentResults: [] },
    };
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('No recent matches.')).toBeTruthy();
  });
});

describe('GameRankings empty state', () => {
  it('shows empty message when no rankings', () => {
    mockProfileState = {
      ...successState,
      data: { ...(successState as { data: object }).data, gameRankings: [] },
    };
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('No game rankings yet.')).toBeTruthy();
  });
});
