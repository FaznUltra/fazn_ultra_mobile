import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChallengeCard } from '../../../components/home/ChallengeCard';
import type { Challenge } from '../../../types/home';

const challenge: Challenge = {
  id: 'fc1',
  title: 'Weekend Warriors Cup',
  game: 'EA FC 25',
  gameBg: '#14532d',
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
};

describe('ChallengeCard', () => {
  it('renders featured card with title, prize and join button', () => {
    const { getByText, getByTestId } = render(
      <ChallengeCard
        challenge={challenge}
        onPress={jest.fn()}
        onJoinPress={jest.fn()}
      />,
    );
    expect(getByText('Weekend Warriors Cup')).toBeTruthy();
    expect(getByTestId('prize-fc1')).toBeTruthy();
    expect(getByText('Join')).toBeTruthy();
    expect(getByTestId('featured-card-fc1')).toBeTruthy();
  });

  it('renders hot card variant', () => {
    const { getByTestId, getByText } = render(
      <ChallengeCard
        challenge={{ ...challenge, isHot: true }}
        variant="hot"
        onPress={jest.fn()}
        onJoinPress={jest.fn()}
      />,
    );
    expect(getByTestId('hot-card-fc1')).toBeTruthy();
    expect(getByText('14/16 joined')).toBeTruthy();
  });

  it('calls onPress and onJoinPress', () => {
    const onPress = jest.fn();
    const onJoinPress = jest.fn();
    const { getByTestId } = render(
      <ChallengeCard
        challenge={challenge}
        onPress={onPress}
        onJoinPress={onJoinPress}
      />,
    );
    fireEvent.press(getByTestId('featured-card-fc1'));
    expect(onPress).toHaveBeenCalled();
    fireEvent.press(getByTestId('join-btn-fc1'));
    expect(onJoinPress).toHaveBeenCalled();
  });
});
