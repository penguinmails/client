import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  UnifiedCard, 
  UnifiedCardHeader, 
  UnifiedCardTitle, 
  UnifiedCardDescription,
  UnifiedCardContent,
  UnifiedCardFooter,
  UnifiedCardAction
} from '../UnifiedCard';

describe('UnifiedCard', () => {
  it('renders with default variant and size', () => {
    render(
      <UnifiedCard data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col', 'rounded-xl', 'border', 'shadow-sm');
  });

  it('renders with outlined variant', () => {
    render(
      <UnifiedCard variant="outlined" data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-2');
  });

  it('renders with elevated variant', () => {
    render(
      <UnifiedCard variant="elevated" data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-lg');
  });

  it('renders with ghost variant', () => {
    render(
      <UnifiedCard variant="ghost" data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-transparent', 'shadow-none');
  });

  it('renders with small size', () => {
    render(
      <UnifiedCard size="sm" data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('gap-4', 'p-4');
  });

  it('renders with large size', () => {
    render(
      <UnifiedCard size="lg" data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('gap-8', 'p-8');
  });

  it('renders complete card structure', () => {
    render(
      <UnifiedCard data-testid="card">
        <UnifiedCardHeader data-testid="header">
          <UnifiedCardTitle data-testid="title">Card Title</UnifiedCardTitle>
          <UnifiedCardDescription data-testid="description">Card description</UnifiedCardDescription>
          <UnifiedCardAction data-testid="action">Action</UnifiedCardAction>
        </UnifiedCardHeader>
        <UnifiedCardContent data-testid="content">Card content</UnifiedCardContent>
        <UnifiedCardFooter data-testid="footer">Card footer</UnifiedCardFooter>
      </UnifiedCard>
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('action')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Card footer')).toBeInTheDocument();
  });

  it('renders header with bordered variant', () => {
    render(
      <UnifiedCard>
        <UnifiedCardHeader bordered data-testid="header">
          <UnifiedCardTitle>Title</UnifiedCardTitle>
        </UnifiedCardHeader>
      </UnifiedCard>
    );
    
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('border-b', 'pb-6');
  });

  it('renders header with action', () => {
    render(
      <UnifiedCard>
        <UnifiedCardHeader withAction data-testid="header">
          <UnifiedCardTitle>Title</UnifiedCardTitle>
          <UnifiedCardAction>Action</UnifiedCardAction>
        </UnifiedCardHeader>
      </UnifiedCard>
    );
    
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('grid-cols-[1fr_auto]');
  });

  it('renders title with different sizes', () => {
    const { rerender } = render(
      <UnifiedCardTitle size="sm" data-testid="title">Small Title</UnifiedCardTitle>
    );
    
    let title = screen.getByTestId('title');
    expect(title).toHaveClass('text-sm');
    
    rerender(
      <UnifiedCardTitle size="lg" data-testid="title">Large Title</UnifiedCardTitle>
    );
    
    title = screen.getByTestId('title');
    expect(title).toHaveClass('text-lg');
  });

  it('applies custom className', () => {
    render(
      <UnifiedCard className="custom-class" data-testid="card">
        <UnifiedCardContent>Test content</UnifiedCardContent>
      </UnifiedCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });
});