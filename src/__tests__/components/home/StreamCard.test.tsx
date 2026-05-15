import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StreamCard } from '../../../components/home/StreamCard';
import type { LiveStream } from '../../../types/home';

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
  };
});

const stream: LiveStream = {
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
};

describe('StreamCard', () => {
  it('renders LIVE badge when isLive', () => {
    const { getByTestId } = render(
      <StreamCard
        stream={stream}
        isPlaying={false}
        onLike={jest.fn()}
        onShare={jest.fn()}
        onHostPress={jest.fn()}
        testID="stream-card-ls1"
      />,
    );
    expect(getByTestId('stream-card-ls1')).toBeTruthy();
    expect(getByTestId('stream-live-ls1')).toBeTruthy();
    expect(getByTestId('stream-play-ls1')).toBeTruthy();
  });

  it('shows waveform when isPlaying', () => {
    const { getByTestId, queryByTestId } = render(
      <StreamCard
        stream={stream}
        isPlaying
        onLike={jest.fn()}
        onShare={jest.fn()}
        onHostPress={jest.fn()}
        testID="stream-card-ls1"
      />,
    );
    expect(getByTestId('stream-waveform-ls1')).toBeTruthy();
    expect(queryByTestId('stream-play-ls1')).toBeNull();
  });

  it('calls onLike, onShare and onHostPress', () => {
    const onLike = jest.fn();
    const onShare = jest.fn();
    const onHostPress = jest.fn();
    const { getByTestId } = render(
      <StreamCard
        stream={stream}
        isPlaying={false}
        onLike={onLike}
        onShare={onShare}
        onHostPress={onHostPress}
        testID="stream-card-ls1"
      />,
    );
    fireEvent.press(getByTestId('stream-like-ls1'));
    expect(onLike).toHaveBeenCalled();
    fireEvent.press(getByTestId('stream-share-ls1'));
    expect(onShare).toHaveBeenCalled();
    fireEvent.press(getByTestId('stream-host-ls1'));
    expect(onHostPress).toHaveBeenCalled();
  });
});
