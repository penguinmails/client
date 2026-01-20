import React from 'react';
import { 
  UnifiedCard, 
  UnifiedCardHeader, 
  UnifiedCardTitle, 
  UnifiedCardDescription,
  UnifiedCardContent,
  UnifiedCardFooter,
  UnifiedCardAction
} from '../UnifiedCard';
import { Button } from '@/components/ui/button/button';
import { MoreHorizontal, Star } from 'lucide-react';

/**
 * Example usage of UnifiedCard component demonstrating all variants and sizes
 * This file serves as documentation and validation of the component's capabilities
 */

export function UnifiedCardExamples() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">UnifiedCard Component Examples</h1>
      
      {/* Variant Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Default Variant */}
          <UnifiedCard variant="default">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Default Card</UnifiedCardTitle>
              <UnifiedCardDescription>Standard card with default styling</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>This is the default card variant with standard border and shadow.</p>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Outlined Variant */}
          <UnifiedCard variant="outlined">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Outlined Card</UnifiedCardTitle>
              <UnifiedCardDescription>Card with emphasized border</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>This card has a thicker border for emphasis.</p>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Elevated Variant */}
          <UnifiedCard variant="elevated">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Elevated Card</UnifiedCardTitle>
              <UnifiedCardDescription>Card with enhanced shadow</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>This card appears elevated with a larger shadow.</p>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Ghost Variant */}
          <UnifiedCard variant="ghost">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Ghost Card</UnifiedCardTitle>
              <UnifiedCardDescription>Minimal card without border</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>This card has no border or shadow for a minimal look.</p>
            </UnifiedCardContent>
          </UnifiedCard>
        </div>
      </section>

      {/* Size Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Small Size */}
          <UnifiedCard size="sm">
            <UnifiedCardHeader>
              <UnifiedCardTitle size="sm">Small Card</UnifiedCardTitle>
              <UnifiedCardDescription>Compact card for tight spaces</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>Small card with reduced padding and spacing.</p>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Default Size */}
          <UnifiedCard size="default">
            <UnifiedCardHeader>
              <UnifiedCardTitle size="default">Default Card</UnifiedCardTitle>
              <UnifiedCardDescription>Standard card size</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>Default card size with standard spacing.</p>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Large Size */}
          <UnifiedCard size="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle size="lg">Large Card</UnifiedCardTitle>
              <UnifiedCardDescription>Spacious card for important content</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <p>Large card with generous padding and spacing.</p>
            </UnifiedCardContent>
          </UnifiedCard>
        </div>
      </section>

      {/* Complex Example with Actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Complex Card with Actions</h2>
        <div className="max-w-md">
          <UnifiedCard variant="elevated">
            <UnifiedCardHeader withAction>
              <div>
                <UnifiedCardTitle>Project Dashboard</UnifiedCardTitle>
                <UnifiedCardDescription>Track your project progress</UnifiedCardDescription>
              </div>
              <UnifiedCardAction>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </UnifiedCardAction>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Tasks Completed</span>
                  <span className="font-semibold">12/20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </UnifiedCardContent>
            <UnifiedCardFooter bordered>
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
              <Button className="flex-1">
                <Star className="mr-2 h-4 w-4" />
                Mark Favorite
              </Button>
            </UnifiedCardFooter>
          </UnifiedCard>
        </div>
      </section>

      {/* Stats Card Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stats Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UnifiedCard variant="outlined" size="sm">
            <UnifiedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">👥</span>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          <UnifiedCard variant="outlined" size="sm">
            <UnifiedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">$45,231</p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm">💰</span>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          <UnifiedCard variant="outlined" size="sm">
            <UnifiedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Growth</p>
                  <p className="text-2xl font-bold">+12.5%</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm">📈</span>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </div>
      </section>
    </div>
  );
}

export default UnifiedCardExamples;