import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EFootballSetupScreen } from '../../../screens/app/create/EFootballSetupScreen';

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

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onChange, testID, value }: { onChange: (e: object, d: Date) => void; testID?: string; value: Date }) =>
      React.createElement(View, {
        testID,
        onStartShouldSetResponder: () => true,
        onChange: () => onChange({}, new Date(Date.now() + 10 * 3_600_000)),
        value,
      }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      platformId: 'mobile',
      platformLabel: 'Mobile',
      gameId: 'efootball_mob',
      gameLabel: 'eFootball 2025 Mobile',
    },
  }),
}));

describe('EFootballSetupScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing and shows key elements', () => {
    const { getByTestId } = render(<EFootballSetupScreen />);
    expect(getByTestId('efootball-setup-screen')).toBeTruthy();
    expect(getByTestId('chip-match-time')).toBeTruthy();
    expect(getByTestId('chip-penalties')).toBeTruthy();
    expect(getByTestId('chip-extra-time')).toBeTruthy();
    expect(getByTestId('stake-input')).toBeTruthy();
    expect(getByTestId('acceptance-row')).toBeTruthy();
    expect(getByTestId('start-row')).toBeTruthy();
    expect(getByTestId('opponent-public')).toBeTruthy();
  });

  it('Continue is disabled when form incomplete', () => {
    const { getByTestId } = render(<EFootballSetupScreen />);
    expect(
      getByTestId('efootball-continue-btn').props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('does not navigate when Continue pressed while incomplete', () => {
    const { getByTestId } = render(<EFootballSetupScreen />);
    fireEvent.press(getByTestId('efootball-continue-btn'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to ChallengeConfirm once the form is valid', () => {
    const { getByTestId } = render(<EFootballSetupScreen />);
    fireEvent.changeText(getByTestId('stake-input'), '1000');
    fireEvent.press(getByTestId('acceptance-row'));
    fireEvent.press(getByTestId('acceptance-picker-done'));
    fireEvent.press(getByTestId('start-row'));
    fireEvent.press(getByTestId('start-picker-done'));
    fireEvent.press(getByTestId('opponent-public'));
    fireEvent.press(getByTestId('efootball-continue-btn'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'ChallengeConfirm',
      expect.objectContaining({ gameId: 'efootball_mob' }),
    );
  });

  it('direct challenge opens friends drawer', () => {
    const { getByTestId } = render(<EFootballSetupScreen />);
    fireEvent.press(getByTestId('opponent-direct'));
    expect(getByTestId('friends-drawer')).toBeTruthy();
  });

  it('back button calls goBack', () => {
    const { getByTestId } = render(<EFootballSetupScreen />);
    fireEvent.press(getByTestId('efootball-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
