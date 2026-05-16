import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ArenaChallengeCard } from '../../../components/arena/ArenaChallengeCard';
import type { ArenaChallenge } from '../../../types/arena';

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

const HOUR = 3_600_000;
const DAY = 86_400_000;

const base: ArenaChallenge = {
  id: 'c1',
  title: 'EA FC 25 — Duel',
  game: 'EA FC 25',
  gameBg: '#14532d',
  platform: 'PS5',
  format: '1v1',
  stake: 2000,
  potentialWin: 3800,
  platformFee: 200,
  currency: '₦',
  status: 'open',
  creator: {
    id: 'u3',
    username: 'sniperghost',
    firstName: 'Marcus',
    lastName: 'Webb',
  },
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
};

describe('ArenaChallengeCard', () => {
  it('renders marketplace card with stake and win amounts', () => {
    const { getByText } = render(
      <ArenaChallengeCard
        challenge={base}
        variant="marketplace"
        onPress={jest.fn()}
        testID="mp-card"
      />,
    );
    expect(getByText('Stake: ₦2,000')).toBeTruthy();
    expect(getByText('Win: ₦3,800')).toBeTruthy();
    expect(getByText('Join Challenge →')).toBeTruthy();
  });

  it('renders live card with LIVE status badge', () => {
    const live: ArenaChallenge = {
      ...base,
      status: 'live',
      opponent: {
        id: 'u5',
        username: 'nova_player',
        firstName: 'Priya',
        lastName: 'Sharma',
      },
    };
    const { getByTestId, getByText } = render(
      <ArenaChallengeCard
        challenge={live}
        variant="live"
        onPress={jest.fn()}
        testID="live-card"
      />,
    );
    expect(getByTestId('card-status-c1')).toBeTruthy();
    expect(getByText('LIVE')).toBeTruthy();
  });

  it('renders invited card with accept and reject buttons', () => {
    const invited: ArenaChallenge = {
      ...base,
      status: 'pending_acceptance',
      userRole: 'opponent',
    };
    const { getByTestId } = render(
      <ArenaChallengeCard
        challenge={invited}
        variant="invited"
        onPress={jest.fn()}
        onAccept={jest.fn()}
        onReject={jest.fn()}
        testID="inv-card"
      />,
    );
    expect(getByTestId('card-accept-c1')).toBeTruthy();
    expect(getByTestId('card-reject-c1')).toBeTruthy();
  });

  it('renders completed win card with WON badge', () => {
    const won: ArenaChallenge = {
      ...base,
      status: 'completed',
      outcome: 'win',
      opponent: {
        id: 'u5',
        username: 'nova_player',
        firstName: 'Priya',
        lastName: 'Sharma',
      },
    };
    const { getByText } = render(
      <ArenaChallengeCard
        challenge={won}
        variant="my-bet"
        onPress={jest.fn()}
        testID="won-card"
      />,
    );
    expect(getByText('WON ₦3,800')).toBeTruthy();
  });

  it('renders completed loss with LOST badge', () => {
    const lost: ArenaChallenge = {
      ...base,
      status: 'completed',
      outcome: 'loss',
      opponent: {
        id: 'u5',
        username: 'nova_player',
        firstName: 'Priya',
        lastName: 'Sharma',
      },
    };
    const { getByText } = render(
      <ArenaChallengeCard
        challenge={lost}
        variant="my-bet"
        onPress={jest.fn()}
        testID="lost-card"
      />,
    );
    expect(getByText('LOST ₦2,000')).toBeTruthy();
  });

  it('renders cancelled card with muted status', () => {
    const cancelled: ArenaChallenge = {
      ...base,
      status: 'cancelled',
      userRole: 'creator',
      createdAt: new Date(Date.now() - 4 * DAY).toISOString(),
    };
    const { getByTestId } = render(
      <ArenaChallengeCard
        challenge={cancelled}
        variant="my-bet"
        onPress={jest.fn()}
        testID="cancelled-card"
      />,
    );
    expect(getByTestId('card-status-c1')).toBeTruthy();
  });

  it('onAccept and onReject callbacks fire correctly', () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();
    const invited: ArenaChallenge = {
      ...base,
      status: 'pending_acceptance',
      userRole: 'opponent',
    };
    const { getByTestId } = render(
      <ArenaChallengeCard
        challenge={invited}
        variant="invited"
        onPress={jest.fn()}
        onAccept={onAccept}
        onReject={onReject}
        testID="inv-card"
      />,
    );
    fireEvent.press(getByTestId('card-accept-c1'));
    fireEvent.press(getByTestId('card-reject-c1'));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledTimes(1);
  });
});
