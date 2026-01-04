import React from 'react';
import { UnifiedButton } from '../UnifiedButton';
import { 
  Star, 
  Plus, 
  Download, 
  Settings, 
  Trash2, 
  Edit, 
  Save,
  Upload,
  RefreshCw,
  Heart,
  Share,
  Bell
} from 'lucide-react';

/**
 * Comprehensive example showcasing all UnifiedButton variants and features
 * This demonstrates the extended button system with design tokens
 */
export function UnifiedButtonExample() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">UnifiedButton Component Examples</h1>
        <p className="text-muted-foreground">
          Comprehensive showcase of all button variants, sizes, and special features
        </p>
      </div>

      {/* Basic Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-3">
          <UnifiedButton variant="default">Default</UnifiedButton>
          <UnifiedButton variant="destructive">Destructive</UnifiedButton>
          <UnifiedButton variant="outline">Outline</UnifiedButton>
          <UnifiedButton variant="secondary">Secondary</UnifiedButton>
          <UnifiedButton variant="ghost">Ghost</UnifiedButton>
          <UnifiedButton variant="link">Link</UnifiedButton>
          <UnifiedButton variant="success">Success</UnifiedButton>
          <UnifiedButton variant="warning">Warning</UnifiedButton>
          <UnifiedButton variant="info">Info</UnifiedButton>
          <UnifiedButton variant="muted">Muted</UnifiedButton>
        </div>
      </section>

      {/* Button Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <UnifiedButton size="xs">Extra Small</UnifiedButton>
          <UnifiedButton size="sm">Small</UnifiedButton>
          <UnifiedButton size="default">Default</UnifiedButton>
          <UnifiedButton size="lg">Large</UnifiedButton>
          <UnifiedButton size="xl">Extra Large</UnifiedButton>
        </div>
      </section>

      {/* Icon Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Icon Buttons</h2>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Icon Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <UnifiedButton size="iconXs" iconOnly>
              <Star className="h-3 w-3" />
            </UnifiedButton>
            <UnifiedButton size="iconSm" iconOnly>
              <Star className="h-4 w-4" />
            </UnifiedButton>
            <UnifiedButton size="icon" iconOnly>
              <Star className="h-4 w-4" />
            </UnifiedButton>
            <UnifiedButton size="iconLg" iconOnly>
              <Star className="h-5 w-5" />
            </UnifiedButton>
            <UnifiedButton size="iconXl" iconOnly>
              <Star className="h-6 w-6" />
            </UnifiedButton>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Icon with Text</h3>
          <div className="flex flex-wrap gap-3">
            <UnifiedButton icon={<Download className="h-4 w-4" />}>
              Download
            </UnifiedButton>
            <UnifiedButton 
              icon={<Upload className="h-4 w-4" />} 
              iconPosition="right"
            >
              Upload
            </UnifiedButton>
            <UnifiedButton 
              variant="outline" 
              icon={<Settings className="h-4 w-4" />}
            >
              Settings
            </UnifiedButton>
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading States</h2>
        <div className="flex flex-wrap gap-3">
          <UnifiedButton loading>Loading</UnifiedButton>
          <UnifiedButton loading loadingText="Saving...">Save</UnifiedButton>
          <UnifiedButton loading variant="outline">Processing</UnifiedButton>
          <UnifiedButton loading iconOnly>
            <Save className="h-4 w-4" />
          </UnifiedButton>
        </div>
      </section>

      {/* Special Button Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Special Button Types</h2>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Rounded Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <UnifiedButton rounded>Rounded</UnifiedButton>
            <UnifiedButton rounded variant="outline">Rounded Outline</UnifiedButton>
            <UnifiedButton rounded iconOnly>
              <Heart className="h-4 w-4" />
            </UnifiedButton>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Floating Action Buttons</h3>
          <div className="relative h-32 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <p className="absolute top-4 left-4 text-sm text-muted-foreground">
              Floating buttons appear in bottom-right corner
            </p>
            {/* Note: In real usage, these would be positioned fixed */}
            <div className="absolute bottom-4 right-4 space-x-2">
              <UnifiedButton 
                floating 
                style={{ position: 'absolute', bottom: '0', right: '0' }}
              >
                <Plus className="h-5 w-5" />
              </UnifiedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Action Button Groups */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Groups & Actions</h2>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Primary Actions</h3>
          <div className="flex flex-wrap gap-2">
            <UnifiedButton variant="default">Create New</UnifiedButton>
            <UnifiedButton variant="outline">Save Draft</UnifiedButton>
            <UnifiedButton variant="ghost">Cancel</UnifiedButton>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Table Actions</h3>
          <div className="flex flex-wrap gap-2">
            <UnifiedButton size="sm" variant="ghost" iconOnly>
              <Edit className="h-4 w-4" />
            </UnifiedButton>
            <UnifiedButton size="sm" variant="ghost" iconOnly>
              <Share className="h-4 w-4" />
            </UnifiedButton>
            <UnifiedButton size="sm" variant="ghost" iconOnly>
              <Trash2 className="h-4 w-4" />
            </UnifiedButton>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Status Actions</h3>
          <div className="flex flex-wrap gap-2">
            <UnifiedButton variant="success" size="sm">Approve</UnifiedButton>
            <UnifiedButton variant="warning" size="sm">Pending</UnifiedButton>
            <UnifiedButton variant="destructive" size="sm">Reject</UnifiedButton>
            <UnifiedButton variant="info" size="sm">Review</UnifiedButton>
          </div>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real-world Examples</h2>
        
        <div className="space-y-6">
          {/* Email Campaign Actions */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Email Campaign Actions</h3>
            <div className="flex flex-wrap gap-2">
              <UnifiedButton variant="default">Send Campaign</UnifiedButton>
              <UnifiedButton variant="outline">Schedule</UnifiedButton>
              <UnifiedButton variant="ghost">Preview</UnifiedButton>
              <UnifiedButton variant="ghost" iconOnly>
                <Settings className="h-4 w-4" />
              </UnifiedButton>
            </div>
          </div>

          {/* Dashboard Quick Actions */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Dashboard Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <UnifiedButton variant="ghost" className="h-16 flex-col gap-1">
                <Plus className="h-5 w-5" />
                <span className="text-xs">New Campaign</span>
              </UnifiedButton>
              <UnifiedButton variant="ghost" className="h-16 flex-col gap-1">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Import Leads</span>
              </UnifiedButton>
              <UnifiedButton variant="ghost" className="h-16 flex-col gap-1">
                <RefreshCw className="h-5 w-5" />
                <span className="text-xs">Sync Data</span>
              </UnifiedButton>
              <UnifiedButton variant="ghost" className="h-16 flex-col gap-1">
                <Bell className="h-5 w-5" />
                <span className="text-xs">Notifications</span>
              </UnifiedButton>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Form Actions</h3>
            <div className="flex justify-between">
              <UnifiedButton variant="ghost">Cancel</UnifiedButton>
              <div className="space-x-2">
                <UnifiedButton variant="outline">Save Draft</UnifiedButton>
                <UnifiedButton variant="default">Submit</UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disabled States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Disabled States</h2>
        <div className="flex flex-wrap gap-3">
          <UnifiedButton disabled>Disabled Default</UnifiedButton>
          <UnifiedButton disabled variant="outline">Disabled Outline</UnifiedButton>
          <UnifiedButton disabled variant="destructive">Disabled Destructive</UnifiedButton>
          <UnifiedButton disabled iconOnly>
            <Star className="h-4 w-4" />
          </UnifiedButton>
        </div>
      </section>
    </div>
  );
}

export default UnifiedButtonExample;