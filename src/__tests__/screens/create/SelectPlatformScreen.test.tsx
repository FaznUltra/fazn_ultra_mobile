import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SelectPlatformScreen } from '../../../screens/app/create/SelectPlatformScreen';

const mockNavigate = jest.fn();
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
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

describe('SelectPlatformScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all 6 platform cards', () => {
    const { getByTestId } = render(<SelectPlatformScreen />);
    [
      'ps4',
      'ps5',
      'xbox_one',
      'xbox_series',
      'pc',
      'mobile',
    ].forEach((id) => {
      expect(getByTestId(`platform-card-${id}`)).toBeTruthy();
    });
  });

  it('selecting a card enables the Continue button', () => {
    const { getByTestId } = render(<SelectPlatformScreen />);
    const btn = getByTestId('platform-continue-btn');
    expect(btn.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(getByTestId('platform-card-ps5'));
    expect(
      getByTestId('platform-continue-btn').props.accessibilityState.disabled,
    ).toBe(false);
  });

  it('selecting a card shows selected state', () => {
    const { getByTestId } = render(<SelectPlatformScreen />);
    const card = getByTestId('platform-card-ps5');
    expect(card.props.accessibilityState.selected).toBe(false);
    fireEvent.press(card);
    expect(
      getByTestId('platform-card-ps5').props.accessibilityState.selected,
    ).toBe(true);
  });

  it('close button calls goBack', () => {
    const { getByTestId } = render(<SelectPlatformScreen />);
    fireEvent.press(getByTestId('platform-close-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('Continue navigates to SelectGame with correct params', () => {
    const { getByTestId } = render(<SelectPlatformScreen />);
    fireEvent.press(getByTestId('platform-card-ps5'));
    fireEvent.press(getByTestId('platform-continue-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('SelectGame', {
      platformId: 'ps5',
      platformLabel: 'PlayStation 5',
    });
  });
});
