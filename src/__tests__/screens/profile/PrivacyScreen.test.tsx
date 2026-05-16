import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PrivacyScreen } from '../../../screens/app/profile/PrivacyScreen';

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
  };
});

function makeNav() {
  return { goBack: jest.fn(), navigate: jest.fn() };
}

function renderScreen(nav = makeNav()) {
  const utils = render(
    <PrivacyScreen
      navigation={nav as never}
      route={{ key: 'k', name: 'Privacy' } as never}
    />,
  );
  return { ...utils, nav };
}

describe('PrivacyScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all toggle rows', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('privacy-screen')).toBeTruthy();
    [
      'public-profile',
      'online-status',
      'game-activity',
      'accept-challenges',
      'match-history',
      'challenge-invites',
      'friend-requests',
      'result-announcements',
    ].forEach((k) => expect(getByTestId(`toggle-${k}`)).toBeTruthy());
  });

  it('toggling a switch changes its value', () => {
    const { getByTestId } = renderScreen();
    const sw = getByTestId('toggle-match-history');
    expect(sw.props.value).toBe(false);
    fireEvent(sw, 'valueChange', true);
    expect(getByTestId('toggle-match-history').props.value).toBe(true);
  });

  it('save button fires alert', () => {
    const spy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('privacy-save-btn'));
    expect(spy).toHaveBeenCalledWith('Saved', 'Privacy settings saved.');
  });

  it('back button calls goBack', () => {
    const { getByTestId, nav } = renderScreen();
    fireEvent.press(getByTestId('privacy-back-btn'));
    expect(nav.goBack).toHaveBeenCalled();
  });
});
