import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedButton } from '../UnifiedButton';
import { Star, Plus, Download, Settings, Trash2, Heart } from 'lucide-react';

const meta: Meta<typeof UnifiedButton> = {
  title: 'Components/Unified/UnifiedButton',
  component: UnifiedButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Extended button component with comprehensive variant system, loading states, icon support, and specialized button types like floating action buttons.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default', 'destructive', 'outline', 'secondary', 
        'ghost', 'link', 'success', 'warning', 'info', 'muted'
      ],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: [
        'xs', 'sm', 'default', 'lg', 'xl',
        'icon', 'iconSm', 'iconLg', 'iconXs', 'iconXl'
      ],
      description: 'Button size variant',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner and disable button',
    },
    loadingText: {
      control: 'text',
      description: 'Custom text to show when loading',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    rounded: {
      control: 'boolean',
      description: 'Make button circular',
    },
    floating: {
      control: 'boolean',
      description: 'Position as floating action button',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Icon-only button with appropriate sizing',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of icon relative to text',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child component (for links, etc.)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const AllVariants: Story = {
  render: () => (
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
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants including the new success, warning, info, and muted variants.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <UnifiedButton size="xs">Extra Small</UnifiedButton>
      <UnifiedButton size="sm">Small</UnifiedButton>
      <UnifiedButton size="default">Default</UnifiedButton>
      <UnifiedButton size="lg">Large</UnifiedButton>
      <UnifiedButton size="xl">Extra Large</UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes from extra small to extra large.',
      },
    },
  },
};

// Icon Stories
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <UnifiedButton icon={<Download className="h-4 w-4" />}>
        Download
      </UnifiedButton>
      <UnifiedButton 
        icon={<Settings className="h-4 w-4" />} 
        iconPosition="right"
        variant="outline"
      >
        Settings
      </UnifiedButton>
      <UnifiedButton 
        icon={<Plus className="h-4 w-4" />}
        variant="success"
      >
        Add New
      </UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons positioned on left or right side of text.',
      },
    },
  },
};

export const IconButtons: Story = {
  render: () => (
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
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons in various sizes. The iconOnly prop automatically adjusts sizing.',
      },
    },
  },
};

// Loading Stories
export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <UnifiedButton loading>Loading</UnifiedButton>
      <UnifiedButton loading loadingText="Saving...">Save</UnifiedButton>
      <UnifiedButton loading variant="outline">Processing</UnifiedButton>
      <UnifiedButton loading iconOnly>
        <Plus className="h-4 w-4" />
      </UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons in loading state with spinner and optional custom loading text.',
      },
    },
  },
};

// Special Types
export const RoundedButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <UnifiedButton rounded>Rounded</UnifiedButton>
      <UnifiedButton rounded variant="outline">Rounded Outline</UnifiedButton>
      <UnifiedButton rounded iconOnly>
        <Heart className="h-4 w-4" />
      </UnifiedButton>
      <UnifiedButton rounded variant="success" size="lg">
        Rounded Large
      </UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with rounded (circular) styling using the rounded prop.',
      },
    },
  },
};

export const FloatingActionButton: Story = {
  render: () => (
    <div className="relative h-32 w-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
      <p className="absolute top-4 left-4 text-sm text-muted-foreground">
        Floating button appears in bottom-right corner
      </p>
      <UnifiedButton 
        floating 
        style={{ position: 'absolute', bottom: '16px', right: '16px' }}
      >
        <Plus className="h-5 w-5" />
      </UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Floating action button positioned in bottom-right corner with elevated styling.',
      },
    },
  },
};

// Real-world Examples
export const TableActions: Story = {
  render: () => (
    <div className="flex gap-1">
      <UnifiedButton size="sm" variant="ghost" iconOnly>
        <Settings className="h-4 w-4" />
      </UnifiedButton>
      <UnifiedButton size="sm" variant="ghost" iconOnly>
        <Download className="h-4 w-4" />
      </UnifiedButton>
      <UnifiedButton size="sm" variant="ghost" iconOnly>
        <Trash2 className="h-4 w-4" />
      </UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common table row action buttons - compact icon-only buttons for data tables.',
      },
    },
  },
};

export const FormActions: Story = {
  render: () => (
    <div className="flex justify-between w-80">
      <UnifiedButton variant="ghost">Cancel</UnifiedButton>
      <div className="space-x-2">
        <UnifiedButton variant="outline">Save Draft</UnifiedButton>
        <UnifiedButton variant="default">Submit</UnifiedButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Typical form action layout with cancel, save draft, and submit buttons.',
      },
    },
  },
};

export const StatusActions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <UnifiedButton variant="success" size="sm">Approve</UnifiedButton>
      <UnifiedButton variant="warning" size="sm">Pending</UnifiedButton>
      <UnifiedButton variant="destructive" size="sm">Reject</UnifiedButton>
      <UnifiedButton variant="info" size="sm">Review</UnifiedButton>
      <UnifiedButton variant="muted" size="sm">Archive</UnifiedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status-based action buttons using semantic color variants.',
      },
    },
  },
};

// Interactive Stories
export const Interactive: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Click me',
    loading: false,
    disabled: false,
    rounded: false,
    floating: false,
    iconOnly: false,
  },
};

export const WithCustomIcon: Story = {
  args: {
    variant: 'outline',
    size: 'default',
    children: 'Download File',
    icon: <Download className="h-4 w-4" />,
    iconPosition: 'left',
  },
};

export const LoadingExample: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Save Changes',
    loading: true,
    loadingText: 'Saving...',
  },
};