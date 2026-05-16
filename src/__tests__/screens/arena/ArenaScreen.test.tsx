import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ArenaScreen } from '../../../screens/app/arena/ArenaScreen';
import type { ArenaData } from '../../../types/arena';

jest.mock('react-native-safe-area-context', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID }: { children: React.ReactNode; testID?: string }) =>
      mockReact.createElement(View, { testID }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

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
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  CommonActions: { navigate: jest.fn() },
}));

const HOUR = 3_600_000;

const me = {
  id: 'u1',
  username: 'kingjames23',
  firstName: 'LeBron',
  lastName: 'James',
};
const rival = {
  id: 'u3',
  username: 'sniperghost',
  firstName: 'Marcus',
  lastName: 'Webb',
};

const sampleData: ArenaData = {
  marketplace: [
    {
      id: 'm1',
      title: 'EA FC 25 — Quick 1v1',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 2000,
      potentialWin: 3800,
      platformFee: 200,
      currency: '₦',
      status: 'open',
      creator: rival,
      opponent: null,
      userRole: 'spectator',
      outcome: null,
      acceptanceDue: new Date(Date.now() + 2 * HOUR).toISOString(),
      gameStartTime: new Date(Date.now() + 4 * HOUR).toISOString(),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: new Date(Date.now() - HOUR).toISOString(),
      rules: 'Best of 1.',
      inviteOnly: false,
    },
  ],
  myChallenges: [
    {
      id: 'b2',
      title: 'COD Live',
      game: 'Call of Duty',
      gameBg: '#1e3a5f',
      platform: 'PC',
      format: '1v1',
      stake: 5000,
      potentialWin: 9500,
      platformFee: 500,
      currency: '₦',
      status: 'live',
      creator: me,
      opponent: rival,
      userRole: 'creator',
      outcome: null,
      acceptanceDue: new Date(Date.now() - 3 * HOUR).toISOString(),
      gameStartTime: new Date(Date.now() - 0.3 * HOUR).toISOString(),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: new Date(Date.now() - 6 * HOUR).toISOString(),
      rules: 'First to 6.',
      inviteOnly: false,
    },
    {
      id: 'b5',
      title: 'FC Completed',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 5000,
      potentialWin: 9500,
      platformFee: 500,
      currency: '₦',
      status: 'completed',
      creator: me,
      opponent: rival,
      userRole: 'creator',
      outcome: 'win',
      acceptanceDue: new Date(Date.now() - 30 * HOUR).toISOString(),
      gameStartTime: new Date(Date.now() - 28 * HOUR).toISOString(),
      gameEndTime: new Date(Date.now() - 27 * HOUR).toISOString(),
      resultSubmittedBy: ['u1', 'u3'],
      createdAt: new Date(Date.now() - 26 * HOUR).toISOString(),
      rules: '6-minute halves.',
      inviteOnly: false,
    },
  ],
  invited: [
    {
      id: 'i1',
      title: 'Invite',
      game: 'EA FC 25',
      gameBg: '#14532d',
      platform: 'PS5',
      format: '1v1',
      stake: 3000,
      potentialWin: 5700,
      platformFee: 300,
      currency: '₦',
      status: 'pending_acceptance',
      creator: rival,
      opponent: me,
      userRole: 'opponent',
      outcome: null,
      acceptanceDue: new Date(Date.now() + HOUR).toISOString(),
      gameStartTime: new Date(Date.now() + 5 * HOUR).toISOString(),
      gameEndTime: null,
      resultSubmittedBy: [],
      createdAt: new Date(Date.now() - 0.5 * HOUR).toISOString(),
      rules: 'Legendary difficulty.',
      inviteOnly: true,
    },
  ],
};

let mockState: object = { status: 'loading' };
const mockAccept = jest.fn();
const mockReject = jest.fn();
const mockCancel = jest.fn();
const mockSubmit = jest.fn();
const mockRefresh = jest.fn();

jest.mock('../../../hooks/useArena', () => ({
  useArena: () => ({
    state: mockState,
    acceptInvite: mockAccept,
    rejectInvite: mockReject,
    cancelChallenge: mockCancel,
    submitResult: mockSubmit,
    refresh: mockRefresh,
  }),
}));

describe('ArenaScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders skeleton while loading', () => {
    mockState = { status: 'loading' };
    const { getByTestId } = render(<ArenaScreen />);
    expect(getByTestId('arena-skeleton')).toBeTruthy();
  });

  it('renders error state + retry', () => {
    mockState = { status: 'error', message: 'Failed to load the Arena.' };
    const { getByTestId, getByText } = render(<ArenaScreen />);
    expect(getByTestId('arena-error')).toBeTruthy();
    expect(getByTestId('arena-retry')).toBeTruthy();
    expect(getByText('Failed to load the Arena.')).toBeTruthy();
    fireEvent.press(getByTestId('arena-retry'));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders marketplace tab by default with challenge cards', () => {
    mockState = { status: 'success', data: sampleData };
    const { getByTestId } = render(<ArenaScreen />);
    expect(getByTestId('marketplace-list')).toBeTruthy();
    expect(getByTestId('marketplace-card-m1')).toBeTruthy();
  });

  it('switching to My Bets tab shows challenges', () => {
    mockState = { status: 'success', data: sampleData };
    const { getByTestId } = render(<ArenaScreen />);
    fireEvent.press(getByTestId('arena-tab-my-bets'));
    expect(getByTestId('my-bets-list')).toBeTruthy();
    expect(getByTestId('my-bets-card-b2')).toBeTruthy();
  });

  it('switching to Invited tab shows accept/reject buttons', () => {
    mockState = { status: 'success', data: sampleData };
    const { getByTestId } = render(<ArenaScreen />);
    fireEvent.press(getByTestId('arena-tab-invited'));
    expect(getByTestId('invited-list')).toBeTruthy();
    expect(getByTestId('card-accept-i1')).toBeTruthy();
    expect(getByTestId('card-reject-i1')).toBeTruthy();
    fireEvent.press(getByTestId('card-accept-i1'));
    expect(mockAccept).toHaveBeenCalledWith('i1');
  });

  it('switching to Live tab shows live challenges', () => {
    mockState = { status: 'success', data: sampleData };
    const { getByTestId } = render(<ArenaScreen />);
    fireEvent.press(getByTestId('arena-tab-live'));
    expect(getByTestId('live-list')).toBeTruthy();
    expect(getByTestId('live-card-b2')).toBeTruthy();
  });

  it('filter pills in My Bets change displayed items', () => {
    mockState = { status: 'success', data: sampleData };
    const { getByTestId, queryByTestId } = render(<ArenaScreen />);
    fireEvent.press(getByTestId('arena-tab-my-bets'));
    fireEvent.press(getByTestId('my-bets-filter-Completed'));
    expect(getByTestId('my-bets-card-b5')).toBeTruthy();
    expect(queryByTestId('my-bets-card-b2')).toBeNull();
  });
});
