import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChallengeSuccessScreen } from '../../../screens/app/create/ChallengeSuccessScreen';

const mockDispatch = jest.fn();
let mockRouteParams = {
  challengeId: 'ch_1',
  gameLabel: 'eFootball 2025 Mobile',
  opponentName: undefined as string | undefined,
};

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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ dispatch: mockDispatch }),
  useRoute: () => ({ params: mockRouteParams }),
  CommonActions: {
    navigate: (a: object) => ({ type: 'NAVIGATE', payload: a }),
    reset: (a: object) => ({ type: 'RESET', payload: a }),
  },
}));

describe('ChallengeSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      challengeId: 'ch_1',
      gameLabel: 'eFootball 2025 Mobile',
      opponentName: undefined,
    };
  });

  it('renders without crashing and shows success UI', () => {
    const { getByTestId, getByText } = render(<ChallengeSuccessScreen />);
    expect(getByTestId('challenge-success-screen')).toBeTruthy();
    expect(getByTestId('success-check')).toBeTruthy();
    expect(getByText('Challenge Created! 🎮')).toBeTruthy();
    expect(
      getByText('Your eFootball 2025 Mobile challenge has been posted'),
    ).toBeTruthy();
  });

  it('shows direct opponent subtitle when opponentName set', () => {
    mockRouteParams = {
      challengeId: 'ch_1',
      gameLabel: 'eFootball 2025 Mobile',
      opponentName: 'Daniel Okafor',
    };
    const { getByText } = render(<ChallengeSuccessScreen />);
    expect(getByText('Challenge sent to Daniel Okafor')).toBeTruthy();
  });

  it('View in Arena dispatches navigation', () => {
    const { getByTestId } = render(<ChallengeSuccessScreen />);
    fireEvent.press(getByTestId('success-arena-btn'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('Create Another dispatches reset', () => {
    const { getByTestId } = render(<ChallengeSuccessScreen />);
    fireEvent.press(getByTestId('success-create-another-btn'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RESET' }),
    );
  });
});
