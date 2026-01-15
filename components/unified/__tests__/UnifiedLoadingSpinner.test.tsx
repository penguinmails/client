import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedLoadingSpinner } from '../UnifiedLoadingSpinner';

describe('UnifiedLoadingSpinner', () => {
  it('renders basic spinner', () => {
    render(<UnifiedLoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('renders with custom text', () => {
    render(<UnifiedLoadingSpinner text="Loading campaigns..." showText />);
    
    expect(screen.getByText('Loading campaigns...', { selector: 'span:not(.sr-only)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading campaigns...');
  });

  it('renders in overlay mode', () => {
    render(<UnifiedLoadingSpinner overlay text="Saving..." showText />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('absolute', 'inset-0', 'z-50');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<UnifiedLoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<UnifiedLoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<UnifiedLoadingSpinner variant="primary" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<UnifiedLoadingSpinner variant="success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('centers content when centered prop is true', () => {
    render(<UnifiedLoadingSpinner centered />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('justify-center');
  });

  it('has proper accessibility attributes', () => {
    render(<UnifiedLoadingSpinner text="Loading data..." />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading data...');
    
    const srText = screen.getByText('Loading data...', { selector: '.sr-only' });
    expect(srText).toBeInTheDocument();
  });
});