import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedButton } from '../UnifiedButton';
import { Star, Plus, Download } from 'lucide-react';
import Link from 'next/link';

describe('UnifiedButton', () => {
  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      render(<UnifiedButton>Click me</UnifiedButton>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<UnifiedButton onClick={handleClick}>Click me</UnifiedButton>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<UnifiedButton disabled>Disabled</UnifiedButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Variants', () => {
    const variants = [
      'default', 'destructive', 'outline', 'secondary', 
      'ghost', 'link', 'success', 'warning', 'info', 'muted'
    ] as const;

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(<UnifiedButton variant={variant}>{variant} button</UnifiedButton>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        // Test that the button has appropriate styling classes
        expect(button.className).toContain('inline-flex');
      });
    });
  });

  describe('Sizes', () => {
    const sizes = [
      'xs', 'sm', 'default', 'lg', 'xl', 
      'icon', 'iconSm', 'iconLg', 'iconXs', 'iconXl'
    ] as const;

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<UnifiedButton size={size}>{size} button</UnifiedButton>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<UnifiedButton loading>Loading</UnifiedButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('svg')).toBeInTheDocument(); // Loader2 icon
    });

    it('shows custom loading text', () => {
      render(
        <UnifiedButton loading loadingText="Saving...">
          Save
        </UnifiedButton>
      );
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<UnifiedButton loading>Loading</UnifiedButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Icon Support', () => {
    it('renders icon on the left by default', () => {
      render(
        <UnifiedButton icon={<Star data-testid="star-icon" />}>
          With Icon
        </UnifiedButton>
      );
      
      const icon = screen.getByTestId('star-icon');
      const button = screen.getByRole('button');
      expect(icon).toBeInTheDocument();
      expect(button).toContainElement(icon);
    });

    it('renders icon on the right when specified', () => {
      render(
        <UnifiedButton 
          icon={<Star data-testid="star-icon" />} 
          iconPosition="right"
        >
          With Icon
        </UnifiedButton>
      );
      
      const icon = screen.getByTestId('star-icon');
      expect(icon).toBeInTheDocument();
    });

    it('handles icon-only buttons', () => {
      render(
        <UnifiedButton iconOnly>
          <Star data-testid="star-icon" />
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('star-icon');
      expect(button).toContainElement(icon);
    });

    it('adjusts size for icon-only buttons', () => {
      render(
        <UnifiedButton iconOnly size="default">
          <Star />
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Special Button Types', () => {
    it('renders rounded buttons', () => {
      render(<UnifiedButton rounded>Rounded</UnifiedButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('renders floating action buttons', () => {
      render(<UnifiedButton floating>FAB</UnifiedButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
    });

    it('combines rounded and floating styles', () => {
      render(<UnifiedButton floating rounded>FAB</UnifiedButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'rounded-full');
    });
  });

  describe('AsChild Prop', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <UnifiedButton asChild>
          <Link href="/test">Link Button</Link>
        </UnifiedButton>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <UnifiedButton className="custom-class">
          Custom
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('combines custom className with variant styles', () => {
      render(
        <UnifiedButton variant="outline" className="border-red-500">
          Custom Outline
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-red-500');
    });
  });

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(
        <UnifiedButton aria-label="Close dialog">
          ×
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      render(<UnifiedButton>Focusable</UnifiedButton>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Complex Scenarios', () => {
    it('handles icon-only loading state', () => {
      render(
        <UnifiedButton iconOnly loading>
          <Plus />
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('handles floating icon-only button', () => {
      render(
        <UnifiedButton floating iconOnly>
          <Plus />
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'rounded-full');
    });

    it('handles all props together', () => {
      const handleClick = jest.fn();
      render(
        <UnifiedButton
          variant="success"
          size="lg"
          icon={<Download />}
          iconPosition="left"
          rounded
          onClick={handleClick}
          className="custom-download-btn"
        >
          Download File
        </UnifiedButton>
      );
      
      const button = screen.getByRole('button', { name: 'Download File' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('rounded-full', 'custom-download-btn');
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });
});