import React from 'react';
import { render } from '@testing-library/react';
import ResetPasswordPage from '@app/[locale]/reset-password/page';

// Mock the next-intl module
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ResetPasswordPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ResetPasswordPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
