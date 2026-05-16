import React from 'react';
import { render } from '@testing-library/react-native';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the title text', () => {
    const { getByText } = render(<SectionHeader title="Match Settings" />);
    expect(getByText('Match Settings')).toBeTruthy();
  });

  it('exposes the testID on the container', () => {
    const { getByTestId } = render(
      <SectionHeader title="Stake" testID="section-stake" />,
    );
    expect(getByTestId('section-stake')).toBeTruthy();
  });
});
