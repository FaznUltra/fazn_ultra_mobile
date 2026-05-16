import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChallengeConfirmScreen } from '../../../screens/app/create/ChallengeConfirmScreen';
import type { ChallengeSetupData } from '../../../types/challenge';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

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
    Polyline: m('polyline'),
  };
});

const mockSetup: ChallengeSetupData = {
  stake: 1000,
  acceptanceDue: new Date(Date.now() + 3_600_000).toISOString(),
  gameStartTime: new Date(Date.now() + 7_200_000).toISOString(),
  opponentType: 'public',
  matchTime: 10,
  penalties: true,
  extraTime: false,
  substitutions: 3,
  teamCondition: 'excellent',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      platformId: 'mobile',
      platformLabel: 'Mobile',
      gameId: 'efootball_mob',
      gameLabel: 'eFootball 2025 Mobile',
      setup: mockSetup,
    },
  }),
}));

describe('ChallengeConfirmScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing and shows review data', () => {
    const { getByTestId, getByText } = render(<ChallengeConfirmScreen />);
    expect(getByTestId('challenge-confirm-screen')).toBeTruthy();
    expect(getByText('eFootball 2025 Mobile')).toBeTruthy();
    expect(getByText('Review Challenge')).toBeTruthy();
    expect(getByTestId('confirm-create-btn')).toBeTruthy();
    expect(getByTestId('confirm-edit-btn')).toBeTruthy();
  });

  it('Edit button calls goBack', () => {
    const { getByTestId } = render(<ChallengeConfirmScreen />);
    fireEvent.press(getByTestId('confirm-edit-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('Create Challenge navigates to ChallengeSuccess', async () => {
    const { getByTestId } = render(<ChallengeConfirmScreen />);
    fireEvent.press(getByTestId('confirm-create-btn'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        'ChallengeSuccess',
        expect.objectContaining({ gameLabel: 'eFootball 2025 Mobile' }),
      ),
    );
  });
});
