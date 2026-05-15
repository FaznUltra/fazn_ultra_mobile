import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlobalSearchScreen } from '../../../screens/app/home/GlobalSearchScreen';
import type { GroupedSearchResults } from '../../../types/home';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => {
    const { View } = require('react-native');
    const mockReact = require('react');
    return mockReact.createElement(View, { testID }, children);
  },
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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

const mockGoBack = jest.fn();
const mockNavigation = { navigate: jest.fn(), goBack: mockGoBack };

let mockQuery = '';
let mockSearchState: object = { status: 'idle' };
const mockHandleQueryChange = jest.fn();

const emptyResults: GroupedSearchResults = {
  players: [],
  challenges: [],
  tournaments: [],
  streams: [],
  games: [],
};

jest.mock('../../../hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => ({
    query: mockQuery,
    searchState: mockSearchState,
    handleQueryChange: mockHandleQueryChange,
    totalResults: (r: GroupedSearchResults) =>
      Object.values(r).reduce((a, arr) => a + arr.length, 0),
  }),
}));

const renderScreen = () =>
  render(
    <GlobalSearchScreen
      navigation={mockNavigation as never}
      route={{} as never}
    />,
  );

describe('GlobalSearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = '';
    mockSearchState = { status: 'idle' };
  });

  it('renders idle state initially', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('global-search-screen')).toBeTruthy();
    expect(getByTestId('search-idle-state')).toBeTruthy();
    expect(getByTestId('search-input')).toBeTruthy();
  });

  it('shows loading indicator during search', () => {
    mockQuery = 'cod';
    mockSearchState = { status: 'loading' };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-loading-state')).toBeTruthy();
  });

  it('shows results after search', () => {
    mockQuery = 'cod';
    mockSearchState = {
      status: 'success',
      query: 'cod',
      results: {
        ...emptyResults,
        challenges: [
          {
            type: 'challenge',
            id: 'c2',
            title: 'COD Warzone Invitational',
            subtitle: 'Call of Duty',
            meta: '28/32 joined',
            gameBg: '#1e3a5f',
          },
        ],
      },
    };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-results-list')).toBeTruthy();
    expect(getByTestId('search-result-c2')).toBeTruthy();
  });

  it('shows empty state with 0 results', () => {
    mockQuery = 'zzz';
    mockSearchState = {
      status: 'success',
      query: 'zzz',
      results: emptyResults,
    };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-empty-state')).toBeTruthy();
  });

  it('back button navigates back', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('search-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
