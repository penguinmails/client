import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedErrorBoundary, UnifiedErrorFallback } from '../UnifiedErrorBoundary';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('UnifiedErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <UnifiedErrorBoundary>
        <ThrowError shouldThrow={false} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <UnifiedErrorBoundary>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(
      <UnifiedErrorBoundary 
        title="Custom Error" 
        message="Custom error message"
      >
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders retry button when showRetry is true', () => {
    render(
      <UnifiedErrorBoundary showRetry>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders home button when showHome is true', () => {
    render(
      <UnifiedErrorBoundary showHome>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders reload button when showReload is true', () => {
    render(
      <UnifiedErrorBoundary showReload>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();
    
    render(
      <UnifiedErrorBoundary showRetry onRetry={onRetry}>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders minimal variant correctly', () => {
    render(
      <UnifiedErrorBoundary variant="minimal" showRetry>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    // Should render as an alert, not a card
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom fallback content</div>;
    
    render(
      <UnifiedErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(screen.getByText('Custom fallback content')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <UnifiedErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </UnifiedErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });
});

describe('UnifiedErrorFallback', () => {
  it('renders error message', () => {
    render(<UnifiedErrorFallback error="Test error message" />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders retry button when retry function is provided', () => {
    const retry = jest.fn();
    
    render(<UnifiedErrorFallback error="Test error" retry={retry} />);
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(retry).toHaveBeenCalled();
  });

  it('renders minimal variant correctly', () => {
    render(
      <UnifiedErrorFallback 
        error="Test error" 
        variant="minimal" 
        retry={() => {}} 
      />
    );
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});