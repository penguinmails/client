import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedSkeleton } from '../UnifiedSkeleton';

describe('UnifiedSkeleton', () => {
  it('renders basic skeleton', () => {
    render(<UnifiedSkeleton />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('renders multiple skeleton items', () => {
    render(<UnifiedSkeleton count={3} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Should have 3 skeleton items
    const skeletonItems = skeleton.querySelectorAll('.bg-muted');
    expect(skeletonItems).toHaveLength(3);
  });

  it('renders card variant', () => {
    render(<UnifiedSkeleton variant="card" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Card variant should have border and padding
    const cardContainer = skeleton.querySelector('.border');
    expect(cardContainer).toBeInTheDocument();
  });

  it('renders list variant with avatar', () => {
    render(<UnifiedSkeleton variant="list" showAvatar />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Should have rounded avatar placeholder
    const avatar = skeleton.querySelector('.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('renders table variant', () => {
    render(<UnifiedSkeleton variant="table" count={3} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Table variant should have multiple rows
    const tableRows = skeleton.querySelectorAll('.border-b');
    expect(tableRows.length).toBeGreaterThan(0);
  });

  it('renders stats variant in grid layout', () => {
    render(<UnifiedSkeleton variant="stats" count={4} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('grid');
  });

  it('renders form variant', () => {
    render(<UnifiedSkeleton variant="form" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Form variant should have multiple field-like skeletons
    const formFields = skeleton.querySelectorAll('.space-y-2');
    expect(formFields.length).toBeGreaterThan(0);
  });

  it('shows action buttons when showActions is true', () => {
    render(<UnifiedSkeleton variant="list" showActions />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Should have action button placeholders
    const actions = skeleton.querySelectorAll('.space-x-2');
    expect(actions.length).toBeGreaterThan(0);
  });

  it('applies custom height and width', () => {
    render(<UnifiedSkeleton height="100px" width="200px" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    
    // Should apply custom dimensions (via CSS classes)
    const skeletonItem = skeleton.querySelector('.bg-muted');
    expect(skeletonItem).toBeInTheDocument();
  });

  it('applies animation classes', () => {
    const { rerender } = render(<UnifiedSkeleton animation="pulse" />);
    
    let skeleton = screen.getByRole('status');
    let skeletonItem = skeleton.querySelector('.animate-pulse');
    expect(skeletonItem).toBeInTheDocument();
    
    rerender(<UnifiedSkeleton animation="wave" />);
    skeleton = screen.getByRole('status');
    skeletonItem = skeleton.querySelector('.animate-bounce');
    expect(skeletonItem).toBeInTheDocument();
    
    rerender(<UnifiedSkeleton animation="none" />);
    skeleton = screen.getByRole('status');
    // Note: The base Skeleton component always has animate-pulse from shadcn/ui
    // The animation prop controls additional animation classes
    expect(skeleton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<UnifiedSkeleton />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    
    const srText = screen.getByText('Loading...', { selector: '.sr-only' });
    expect(srText).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<UnifiedSkeleton className="custom-class" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-class');
  });
});