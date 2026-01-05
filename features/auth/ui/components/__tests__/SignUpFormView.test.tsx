import React from 'react';
import { render } from '@testing-library/react';
import SignUpFormView from '@app/[locale]/signup/SignUpFormView';

// Mock the next-intl module
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('SignUpFormView', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<SignUpFormView />);
    expect(asFragment()).toMatchSnapshot();
  });
});
