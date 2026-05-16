import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EditProfileScreen } from '../../../screens/app/profile/EditProfileScreen';

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

const mockUser = {
  id: 'u1',
  first_name: 'LeBron',
  last_name: 'James',
  username: 'kingjames23',
  email: 'lebron@fazn.com',
};

jest.mock('../../../store/auth.store', () => ({
  useAuthStore: (selector: (s: object) => unknown) =>
    selector({ user: mockUser }),
}));

function makeNav() {
  return { goBack: jest.fn(), navigate: jest.fn() };
}

function renderScreen(nav = makeNav()) {
  const utils = render(
    <EditProfileScreen
      navigation={nav as never}
      route={{ key: 'k', name: 'EditProfile' } as never}
    />,
  );
  return { ...utils, nav };
}

describe('EditProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders with user data pre-filled', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('edit-profile-screen')).toBeTruthy();
    expect(getByTestId('edit-first-name').props.value).toBe('LeBron');
    expect(getByTestId('edit-last-name').props.value).toBe('James');
    expect(getByTestId('edit-username').props.value).toBe('kingjames23');
  });

  it('save button disabled initially (no changes)', () => {
    const { getByTestId } = renderScreen();
    expect(
      getByTestId('edit-save-btn').props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('save button enabled after editing first name', () => {
    const { getByTestId } = renderScreen();
    fireEvent.changeText(getByTestId('edit-first-name'), 'Bron');
    expect(
      getByTestId('edit-save-btn').props.accessibilityState.disabled,
    ).toBe(false);
  });

  it('back button calls goBack', () => {
    const { getByTestId, nav } = renderScreen();
    fireEvent.press(getByTestId('edit-back-btn'));
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('bio character counter shows correct count', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('edit-bio-counter').props.children).toEqual([
      0,
      '/',
      160,
    ]);
    fireEvent.changeText(getByTestId('edit-bio'), 'Hello');
    expect(getByTestId('edit-bio-counter').props.children).toEqual([
      5,
      '/',
      160,
    ]);
  });

  it('save success shows alert and calls goBack', () => {
    const spy = jest.spyOn(Alert, 'alert');
    const { getByTestId, nav } = renderScreen();
    fireEvent.changeText(getByTestId('edit-first-name'), 'Bron');
    fireEvent.press(getByTestId('edit-save-btn'));
    expect(spy).toHaveBeenCalledWith(
      'Saved',
      'Your profile has been updated.',
      expect.any(Array),
    );
    // invoke the OK callback
    const buttons = spy.mock.calls[0][2] as { onPress?: () => void }[];
    buttons[0].onPress?.();
    expect(nav.goBack).toHaveBeenCalled();
  });
});
