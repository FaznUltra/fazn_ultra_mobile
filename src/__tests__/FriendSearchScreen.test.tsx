import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { FriendSearchScreen } from '../screens/app/friends/FriendSearchScreen';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => {
    const { View } = require('react-native');
    const mockReact = require('react');
    return mockReact.createElement(View, { testID }, children);
  },
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
  };
});

const mockGoBack = jest.fn();
const mockNavigation = { navigate: jest.fn(), goBack: mockGoBack, canGoBack: () => true };

let mockQuery = '';
let mockSearchState: object = { status: 'idle' };
const mockHandleQueryChange = jest.fn();
const mockUpdateUserStatus = jest.fn();

jest.mock('../hooks/useFriendSearch', () => ({
  useFriendSearch: () => ({
    query: mockQuery,
    searchState: mockSearchState,
    handleQueryChange: mockHandleQueryChange,
    updateUserStatus: mockUpdateUserStatus,
  }),
}));

const renderScreen = () =>
  render(<FriendSearchScreen navigation={mockNavigation as never} route={{} as never} />);

describe('FriendSearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = '';
    mockSearchState = { status: 'idle' };
  });

  it('renders the screen', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('friend-search-screen')).toBeTruthy();
  });

  it('renders search input', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('friend-search-input')).toBeTruthy();
  });

  it('shows idle state with no query', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-idle-state')).toBeTruthy();
  });

  it('shows min chars hint when 1-2 chars typed', () => {
    mockQuery = 'ab';
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-min-chars-state')).toBeTruthy();
  });

  it('shows loading state', () => {
    mockQuery = 'qui';
    mockSearchState = { status: 'loading' };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-loading-state')).toBeTruthy();
  });

  it('shows results list on success', () => {
    mockQuery = 'qui';
    mockSearchState = {
      status: 'success',
      query: 'qui',
      results: [
        {
          id: 'q1',
          username: 'quake_champ',
          firstName: 'Ryan',
          lastName: 'Blake',
          onlineStatus: 'online',
          isFavourite: false,
          friendshipStatus: 'none',
          mutualFriendsCount: 1,
        },
      ],
    };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-results-list')).toBeTruthy();
    expect(getByTestId('search-result-q1')).toBeTruthy();
  });

  it('shows no results state when empty results', () => {
    mockQuery = 'xyz';
    mockSearchState = { status: 'success', query: 'xyz', results: [] };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-no-results-state')).toBeTruthy();
  });

  it('shows error state', () => {
    mockQuery = 'qui';
    mockSearchState = { status: 'error', message: 'Search failed' };
    const { getByTestId } = renderScreen();
    expect(getByTestId('search-error-state')).toBeTruthy();
  });

  it('calls handleQueryChange when typing', () => {
    const { getByTestId } = renderScreen();
    fireEvent.changeText(getByTestId('friend-search-input'), 'qui');
    expect(mockHandleQueryChange).toHaveBeenCalledWith('qui');
  });

  it('shows clear button when query is not empty', () => {
    mockQuery = 'qui';
    const { getByTestId } = renderScreen();
    expect(getByTestId('friend-search-clear')).toBeTruthy();
  });

  it('clears query on clear button press', () => {
    mockQuery = 'test';
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('friend-search-clear'));
    expect(mockHandleQueryChange).toHaveBeenCalledWith('');
  });

  it('navigates back on back button press', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('search-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('shows phonebook import banner', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('phonebook-btn')).toBeTruthy();
  });
});
