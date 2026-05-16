import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SelectGameScreen } from '../../../screens/app/create/SelectGameScreen';

const mockGoBack = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({
      children,
      testID,
    }: {
      children: React.ReactNode;
      testID?: string;
    }) => mockReact.createElement(View, { testID }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
  useRoute: () => ({
    params: { platformId: 'ps5', platformLabel: 'PlayStation 5' },
  }),
}));

const ps5Route = {
  params: { platformId: 'ps5', platformLabel: 'PlayStation 5' },
};
const mobileRoute = {
  params: { platformId: 'mobile', platformLabel: 'Mobile' },
};

describe('SelectGameScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders games grouped by genre for selected platform', () => {
    const { getByTestId } = render(<SelectGameScreen route={ps5Route} />);
    expect(getByTestId('game-row-ea_fc_25')).toBeTruthy();
    expect(getByTestId('game-row-nba_2k25')).toBeTruthy();
  });

  it('PS5 does not show mobile-only games', () => {
    const { queryByTestId } = render(<SelectGameScreen route={ps5Route} />);
    expect(queryByTestId('game-row-clash_royale')).toBeNull();
    expect(queryByTestId('game-row-pubg_mobile')).toBeNull();
  });

  it('mobile platform shows mobile-only games and not PS5-only', () => {
    const { getByTestId, queryByTestId } = render(
      <SelectGameScreen route={mobileRoute} />,
    );
    expect(getByTestId('game-row-clash_royale')).toBeTruthy();
    expect(getByTestId('game-row-pubg_mobile')).toBeTruthy();
    expect(queryByTestId('game-row-gt7')).toBeNull();
    expect(queryByTestId('game-row-nba_2k25')).toBeNull();
  });

  it('search filters the game list', () => {
    const { getByTestId, queryByTestId } = render(
      <SelectGameScreen route={ps5Route} />,
    );
    fireEvent.changeText(getByTestId('game-search-input'), 'tekken');
    expect(getByTestId('game-row-tekken_8')).toBeTruthy();
    expect(queryByTestId('game-row-ea_fc_25')).toBeNull();
  });

  it('selecting a game enables Continue', () => {
    const { getByTestId } = render(<SelectGameScreen route={ps5Route} />);
    expect(
      getByTestId('game-continue-btn').props.accessibilityState.disabled,
    ).toBe(true);
    fireEvent.press(getByTestId('game-row-ea_fc_25'));
    expect(
      getByTestId('game-continue-btn').props.accessibilityState.disabled,
    ).toBe(false);
  });

  it('back button calls goBack', () => {
    const { getByTestId } = render(<SelectGameScreen route={ps5Route} />);
    fireEvent.press(getByTestId('game-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('empty state shows when search has no results', () => {
    const { getByTestId } = render(<SelectGameScreen route={ps5Route} />);
    fireEvent.changeText(getByTestId('game-search-input'), 'zzzzzz');
    expect(getByTestId('game-empty-state')).toBeTruthy();
  });

  it('Continue shows coming soon alert for games without setup', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<SelectGameScreen route={ps5Route} />);
    fireEvent.press(getByTestId('game-row-ea_fc_25'));
    fireEvent.press(getByTestId('game-continue-btn'));
    expect(spy).toHaveBeenCalledWith(
      'Coming soon',
      "This game's challenge setup is coming soon.",
    );
    spy.mockRestore();
  });
});
