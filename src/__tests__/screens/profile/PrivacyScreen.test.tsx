import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

const mockGetPrivacy = jest.fn().mockResolvedValue({
  showOnlineStatus: true,
  showStats: true,
  showRecentResults: false,
  allowChallengesFrom: 'everyone',
});

const mockUpdatePrivacy = jest.fn().mockResolvedValue({});

jest.mock('../../../lib/api', () => ({
  profileApi: {
    getPrivacy: () => mockGetPrivacy(),
    updatePrivacy: (...args: unknown[]) => mockUpdatePrivacy(...args),
  },
  ApiError: class ApiError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
}));

function makeNav() {
  return { goBack: jest.fn(), navigate: jest.fn() };
}

async function renderScreen(nav = makeNav()) {
  const utils = render(
    <PrivacyScreen
      navigation={nav as never}
      route={{ key: 'k', name: 'Privacy' } as never}
    />,
  );
  await waitFor(() => utils.getByTestId('privacy-screen'));
  return { ...utils, nav };
}

describe('PrivacyScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all toggle rows', async () => {
    const { getByTestId } = await renderScreen();
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

  it('toggling a switch changes its value', async () => {
    const { getByTestId } = await renderScreen();
    const sw = getByTestId('toggle-match-history');
    const initialValue = sw.props.value;
    fireEvent(sw, 'valueChange', !initialValue);
    expect(getByTestId('toggle-match-history').props.value).toBe(!initialValue);
  });

  it('save button calls updatePrivacy', async () => {
    const { getByTestId } = await renderScreen();
    fireEvent.press(getByTestId('privacy-save-btn'));
    await waitFor(() => expect(mockUpdatePrivacy).toHaveBeenCalled());
  });

  it('back button calls goBack', async () => {
    const { getByTestId, nav } = await renderScreen();
    fireEvent.press(getByTestId('privacy-back-btn'));
    expect(nav.goBack).toHaveBeenCalled();
  });
});
