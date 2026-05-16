import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChallengeDetailScreen } from '../../../screens/app/arena/ChallengeDetailScreen';
import type { ArenaChallenge } from '../../../types/arena';

jest.mock('react-native-safe-area-context', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({
      children,
      testID,
    }: {
      children: React.ReactNode;
      testID?: string;
    }) => mockReact.createElement(View, { testID }, children),
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

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: jest.fn() }),
  useRoute: () => ({ params: { challengeId: 'test-id' } }),
}));

const HOUR = 3_600_000;
const me = { id: 'u1', username: 'kingjames23', firstName: 'L', lastName: 'J' };
const rival = { id: 'u3', username: 'sniperghost', firstName: 'M', lastName: 'W' };

function makeChallenge(over: Partial<ArenaChallenge>): ArenaChallenge {
  return {
    id: 'test-id',
    title: 'eFootball 2025 — Test',
    game: 'eFootball 2025',
    gameBg: '#1a472a',
    platform: 'Mobile',
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
    ...over,
  };
}

let mockCurrent: ArenaChallenge = makeChallenge({});
const mockAccept = jest.fn();
const mockReject = jest.fn();
const mockCancel = jest.fn();
const mockStart = jest.fn();
const mockAgree = jest.fn();
const mockRetry = jest.fn();

jest.mock('../../../hooks/useArena', () => ({
  useArena: () => ({
    state: { status: 'success', data: {} },
    getChallengeById: () => mockCurrent,
    acceptChallenge: mockAccept,
    rejectChallenge: mockReject,
    cancelChallenge: mockCancel,
    startChallenge: mockStart,
    agreeToStart: mockAgree,
    retry: mockRetry,
  }),
}));

describe('ChallengeDetailScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crash for open status (spectator)', () => {
    mockCurrent = makeChallenge({});
    const { getByTestId } = render(<ChallengeDetailScreen />);
    expect(getByTestId('challenge-detail-screen')).toBeTruthy();
    expect(getByTestId('cd-players')).toBeTruthy();
  });

  it('shows Accept Challenge for spectator on open challenge', () => {
    mockCurrent = makeChallenge({ status: 'open', userRole: 'spectator' });
    const { getByTestId } = render(<ChallengeDetailScreen />);
    expect(getByTestId('cd-accept-btn')).toBeTruthy();
    fireEvent.press(getByTestId('cd-accept-btn'));
    expect(mockAccept).toHaveBeenCalledWith('test-id');
  });

  it('shows Cancel Challenge for creator on open challenge', () => {
    mockCurrent = makeChallenge({
      status: 'open',
      userRole: 'creator',
      creator: me,
    });
    const { getByTestId } = render(<ChallengeDetailScreen />);
    expect(getByTestId('cd-cancel-btn')).toBeTruthy();
  });

  it('shows Accept + Decline for opponent on pending_acceptance', () => {
    mockCurrent = makeChallenge({
      status: 'pending_acceptance',
      userRole: 'opponent',
      creator: rival,
      opponent: me,
    });
    const { getByTestId } = render(<ChallengeDetailScreen />);
    expect(getByTestId('cd-accept-btn')).toBeTruthy();
    expect(getByTestId('cd-decline-btn')).toBeTruthy();
  });

  it('shows Start Match for creator on accepted challenge', () => {
    mockCurrent = makeChallenge({
      status: 'accepted',
      userRole: 'creator',
      creator: me,
      opponent: rival,
    });
    const { getByTestId } = render(<ChallengeDetailScreen />);
    expect(getByTestId('cd-start-btn')).toBeTruthy();
    fireEvent.press(getByTestId('cd-start-btn'));
    expect(mockStart).toHaveBeenCalledWith('test-id');
  });

  it('awaiting_result shows AI message and no action buttons', () => {
    mockCurrent = makeChallenge({
      status: 'awaiting_result',
      userRole: 'creator',
      creator: me,
      opponent: rival,
    });
    const { getByTestId, queryByTestId, getByText } = render(
      <ChallengeDetailScreen />,
    );
    expect(getByTestId('cd-action-awaiting')).toBeTruthy();
    expect(getByText(/AI is analysing/)).toBeTruthy();
    expect(queryByTestId('cd-accept-btn')).toBeNull();
    expect(queryByTestId('cd-start-btn')).toBeNull();
  });

  it('completed win shows You Won!', () => {
    mockCurrent = makeChallenge({
      status: 'completed',
      outcome: 'win',
      userRole: 'creator',
      creator: me,
      opponent: rival,
    });
    const { getByText } = render(<ChallengeDetailScreen />);
    expect(getByText('You Won!')).toBeTruthy();
  });

  it('back button calls goBack', () => {
    mockCurrent = makeChallenge({});
    const { getByTestId } = render(<ChallengeDetailScreen />);
    fireEvent.press(getByTestId('cd-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
