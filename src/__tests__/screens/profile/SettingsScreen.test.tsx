import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SettingsScreen } from '../../../screens/app/profile/SettingsScreen';

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
    <SettingsScreen
      navigation={nav as never}
      route={{ key: 'k', name: 'Settings' } as never}
    />,
  );
  return { ...utils, nav };
}

describe('SettingsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all setting rows', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('settings-screen')).toBeTruthy();
    [
      'settings-change-password',
      'settings-phone',
      'settings-2fa',
      'settings-language',
      'settings-theme',
      'settings-clear-cache',
      'settings-help',
      'settings-bug',
      'settings-terms',
      'settings-privacy-policy',
      'settings-delete-account',
    ].forEach((id) => expect(getByTestId(id)).toBeTruthy());
  });

  it('delete account shows confirmation alert', () => {
    const spy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('settings-delete-account'));
    expect(spy).toHaveBeenCalledWith(
      'Delete Account',
      'Are you sure you want to delete your account?',
      expect.any(Array),
    );
    // press Continue -> second confirmation
    const buttons = spy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    buttons.find((b) => b.text === 'Continue')?.onPress?.();
    expect(spy).toHaveBeenCalledWith(
      'This cannot be undone',
      'All your data will be permanently removed.',
      expect.any(Array),
    );
  });

  it('toggle rows render and respond to change', () => {
    const { getByTestId } = renderScreen();
    const sms = getByTestId('toggle-sms');
    expect(sms.props.value).toBe(false);
    fireEvent(sms, 'valueChange', true);
    expect(getByTestId('toggle-sms').props.value).toBe(true);
    expect(getByTestId('toggle-push').props.value).toBe(true);
    expect(getByTestId('toggle-email').props.value).toBe(true);
  });

  it('back button calls goBack', () => {
    const { getByTestId, nav } = renderScreen();
    fireEvent.press(getByTestId('settings-back-btn'));
    expect(nav.goBack).toHaveBeenCalled();
  });
});
