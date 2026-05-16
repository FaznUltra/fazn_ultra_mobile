import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { StreamingChannelsScreen } from '../../../screens/app/profile/StreamingChannelsScreen';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const m = (n: string) => (p: object) =>
    React.createElement(View, { testID: `svg-${n}`, ...p });
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

function makeNav() {
  return { goBack: jest.fn(), navigate: jest.fn() };
}

function renderScreen(nav = makeNav()) {
  const utils = render(
    <StreamingChannelsScreen
      navigation={nav as never}
      route={{ key: 'k', name: 'StreamingChannels' } as never}
    />,
  );
  return { ...utils, nav };
}

describe('StreamingChannelsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders streaming-screen testID', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('streaming-screen')).toBeTruthy();
  });

  it('recorder toggle visible and defaults to true', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('toggle-recorder').props.value).toBe(true);
  });

  it('toggling recorder off shows warning chip', () => {
    const { getByTestId, queryByTestId } = renderScreen();
    expect(queryByTestId('recorder-warning')).toBeNull();
    fireEvent(getByTestId('toggle-recorder'), 'valueChange', false);
    expect(getByTestId('recorder-warning')).toBeTruthy();
  });

  it('youtube-row and twitch-row visible', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('youtube-row')).toBeTruthy();
    expect(getByTestId('twitch-row')).toBeTruthy();
  });

  it('connect-youtube press calls Alert', () => {
    const spy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('connect-youtube'));
    expect(spy).toHaveBeenCalledWith(
      'Connect YouTube',
      expect.any(String),
      expect.any(Array),
    );
  });

  it('back button calls goBack', () => {
    const { getByTestId, nav } = renderScreen();
    fireEvent.press(getByTestId('streaming-back-btn'));
    expect(nav.goBack).toHaveBeenCalled();
  });
});
