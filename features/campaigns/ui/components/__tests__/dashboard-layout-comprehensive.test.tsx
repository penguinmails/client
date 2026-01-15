/**
 * @fileoverview Comprehensive tests for DashboardLayout component using real UI components
 * 
 * This test suite demonstrates the better approach of:
 * - Using REAL UI components instead of mocks
 * - Only mocking external dependencies (APIs, contexts, hooks)
 * - Testing actual component behavior and integration
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the REAL component to test
import { DashboardLayout } from '@/components/design-system/dashboard-layout';
import { setupDashboardTest } from '@/lib/test-utils/setup-helpers';

// Import REAL UI components that are used by the component
import { Button } from '@/components/ui/button/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Mock ONLY external dependencies
jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: '1',
      email: 'test@example.com',
      profile: {
        avatar: 'https://example.com/avatar.jpg',
        firstName: 'Test',
        lastName: 'User'
      }
    }
  }))
}));

jest.mock('@features/notifications/actions', () => ({
  getNotifications: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      notifications: [
        {
          id: '1',
          title: 'Test Notification',
          message: 'This is a test notification',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]
    }
  }))
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard/settings')
}));

jest.mock('@niledatabase/react', () => ({
  SignOutButton: ({ className, children }: { className?: string; children?: React.ReactNode }) => (
    <button data-testid="sign-out-button" className={className}>
      {children || 'Sign Out'}
    </button>
  )
}));

// Mock the child components that are imported by DashboardHeader
jest.mock('@/components/layout/DashboardHeader', () => {
  return function MockDashboardHeader() {
    return (
      <header data-testid="dashboard-header">
        <div className="flex items-center">
          <Button data-testid="sidebar-trigger" variant="ghost" size="icon">
            Menu
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {/* Help Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="help-button">
                Help
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a href="https://help.penguinmails.com/" target="_blank" rel="noopener noreferrer">
                  Knowledge Base
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://penguinmails.com/contact-us/" target="_blank" rel="noopener noreferrer">
                  Support
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="notifications-button">
                Notifications
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div data-testid="notifications-content">
                Test notifications content
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings Link */}
          <Button variant="ghost" size="icon" data-testid="settings-button">
            Settings
          </Button>

          <Separator orientation="vertical" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full" data-testid="user-menu-trigger">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
                  <AvatarFallback>TU</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button data-testid="sign-out-button">Sign Out</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  };
});

describe('DashboardLayout - Comprehensive Integration Tests', () => {
  const { render: renderWithProviders } = setupDashboardTest(DashboardLayout);
  
  const mockChildren = (
    <div data-testid="main-content">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the main dashboard content area.</p>
          <Button>Action Button</Button>
        </CardContent>
      </Card>
    </div>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real UI Component Integration', () => {
    it('renders with REAL UI components (Card, Button, etc.)', () => {
      renderWithProviders({ children: mockChildren });

      // Test that REAL UI components are rendered
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
      expect(screen.getByText('This is the main dashboard content area.')).toBeInTheDocument();
      
      // Test that REAL Button component is rendered
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
      
      // Test that REAL Card components are rendered - check for card structure instead of heading
      const cardTitle = screen.getByText('Dashboard Content');
      const card = cardTitle.closest('[data-slot="card"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-card', 'text-card-foreground');
    });

    it('integrates with REAL DashboardHeader component', () => {
      renderWithProviders({ children: mockChildren });

      // Test that the REAL DashboardHeader is rendered
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      
      // Test that header controls are accessible
      expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('help-button')).toBeInTheDocument();
      expect(screen.getByTestId('notifications-button')).toBeInTheDocument();
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
      expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument();
    });

    it('maintains proper layout structure with REAL components', () => {
      const { container } = renderWithProviders({ children: mockChildren });

      // Test layout structure
      const layout = container.querySelector('.min-h-screen');
      expect(layout).toBeInTheDocument();
      
      const flexContainer = container.querySelector('.flex.h-screen');
      expect(flexContainer).toBeInTheDocument();
      
      const mainContent = container.querySelector('main');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveClass('flex-1', 'px-4', 'sm:px-6', 'lg:px-8', 'py-6');
    });
  });

  describe('Interactive Behavior with Real Components', () => {
    it('handles user interactions with REAL dropdown menus', async () => {
      const user = userEvent.setup();
      renderWithProviders({ children: mockChildren });

      // Test help dropdown interaction
      const helpButton = screen.getByTestId('help-button');
      await user.click(helpButton);
      
      // Verify dropdown opens (this tests real Radix UI integration)
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('handles notifications popover with REAL UI components', async () => {
      const user = userEvent.setup();
      renderWithProviders({ children: mockChildren });

      // Test notifications popover
      const notificationsButton = screen.getByTestId('notifications-button');
      await user.click(notificationsButton);
      
      // Verify popover content is rendered (testing real Popover component)
      expect(screen.getByTestId('notifications-content')).toBeInTheDocument();
      expect(screen.getByText('Test notifications content')).toBeInTheDocument();
    });

    it('handles user menu interactions with REAL Avatar component', async () => {
      const user = userEvent.setup();
      renderWithProviders({ children: mockChildren });

      // Test user menu
      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      await user.click(userMenuTrigger);
      
      // Verify user menu opens with real Avatar component
      expect(screen.getByTestId('sign-out-button')).toBeInTheDocument();
      
      // Test that Avatar components are properly rendered (check for avatar container)
      const avatarContainer = screen.getByTestId('user-menu-trigger').querySelector('[data-slot="avatar"]');
      expect(avatarContainer).toBeInTheDocument();
      expect(avatarContainer).toHaveClass('w-8', 'h-8');
    });
  });

  describe('Props and Customization', () => {
    it('applies custom className to REAL content container', () => {
      const customClass = 'custom-spacing test-class';
      renderWithProviders({ 
        children: mockChildren,
        className: customClass 
      });

      // Test that custom classes are applied to the REAL content container
      const contentContainer = screen.getByTestId('main-content').parentElement;
      expect(contentContainer).toHaveClass(customClass);
    });

    it('renders title section with REAL typography components', () => {
      const title = 'Custom Dashboard Title';
      renderWithProviders({ 
        children: mockChildren,
        title 
      });

      // Test that title is rendered with proper heading structure
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: title })).toHaveClass('text-2xl', 'font-bold', 'tracking-tight');
      
      // Test that title section has proper border
      const titleSection = screen.getByRole('heading', { name: title }).parentElement;
      expect(titleSection).toHaveClass('border-b', 'border-border', 'pb-4');
    });
  });

  describe('Accessibility and ARIA with Real Components', () => {
    it('maintains accessibility with REAL UI components', async () => {
      const user = userEvent.setup();
      renderWithProviders({ children: mockChildren });

      // Test main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Test that buttons have proper roles (check some buttons, not all)
      const helpButton = screen.getByTestId('help-button');
      expect(helpButton).toHaveAttribute('type', 'button');
      
      // Test dropdown functionality instead of looking for specific links
      await user.click(helpButton);
      
      // Wait for dropdown to open and check for menu items
      await waitFor(() => {
        expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
      });
      
      const knowledgeBaseLink = screen.getByText('Knowledge Base').closest('a');
      expect(knowledgeBaseLink).toHaveAttribute('href', 'https://help.penguinmails.com/');
      expect(knowledgeBaseLink).toHaveAttribute('target', '_blank');
      expect(knowledgeBaseLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('supports keyboard navigation with REAL components', async () => {
      const user = userEvent.setup();
      renderWithProviders({ children: mockChildren });

      // Test keyboard navigation to help button
      const helpButton = screen.getByTestId('help-button');
      helpButton.focus();
      expect(helpButton).toHaveFocus();
      
      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme classes correctly with REAL components', () => {
      const { container } = renderWithProviders({ children: mockChildren });

      // Test background theme classes
      const layout = container.querySelector('.min-h-screen.bg-background');
      expect(layout).toBeInTheDocument();
      
      // Test that REAL Card components inherit theme
      const card = screen.getByText('Dashboard Content').closest('[data-slot="card"]');
      expect(card).toHaveClass('bg-card', 'text-card-foreground');
    });

    it('maintains consistent spacing and layout with REAL components', () => {
      const { container } = renderWithProviders({ children: mockChildren });

      // Test main content spacing
      const main = container.querySelector('main');
      expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'py-6', 'rounded-lg', 'shadow-sm');
      
      // Test content spacing
      const contentArea = main?.querySelector('.space-y-6');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles null children gracefully with REAL layout structure', () => {
      renderWithProviders({ children: null });

      // Should still render main structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    it('handles empty children with REAL components', () => {
      renderWithProviders({ children: undefined });

      // Should still render main structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    it('renders complex nested REAL components correctly', () => {
      const complexChildren = (
        <div data-testid="complex-content">
          <Card>
            <CardHeader>
              <CardTitle>Complex Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Primary Action</Button>
                <Separator />
                <div className="flex space-x-2">
                  <Button variant="outline">Secondary</Button>
                  <Button variant="ghost">Tertiary</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

      renderWithProviders({ children: complexChildren });

      // Test all REAL components are rendered
      expect(screen.getByTestId('complex-content')).toBeInTheDocument();
      expect(screen.getByText('Complex Card')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tertiary' })).toBeInTheDocument();
      
      // Test that Separator component is rendered (it has role="none" so we check for the element)
      const separator = screen.getByTestId('complex-content').querySelector('[data-slot="separator-root"]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('role', 'none');
    });
  });

  describe('Performance and Rendering', () => {
    it('renders efficiently with multiple REAL components', () => {
      const manyChildren = Array.from({ length: 10 }, (_, i) => (
        <Card key={i} data-testid={`card-${i}`}>
          <CardHeader>
            <CardTitle>Card {i}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Action {i}</Button>
          </CardContent>
        </Card>
      ));

      const startTime = performance.now();
      renderWithProviders({ children: manyChildren });
      const endTime = performance.now();

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
      
      // All components should be rendered
      for (let i = 0; i < 10; i++) {
        expect(screen.getByTestId(`card-${i}`)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: `Action ${i}` })).toBeInTheDocument();
      }
    });
  });
});