# UnifiedButton Component

The `UnifiedButton` component is an extended button implementation that provides comprehensive variant support, loading states, icon integration, and specialized button types like floating action buttons. It's built on top of the design token system for consistent styling across the application.

## Features

- **10 Visual Variants**: Default, destructive, outline, secondary, ghost, link, success, warning, info, muted
- **10 Size Options**: xs, sm, default, lg, xl, plus icon-specific sizes (iconXs, iconSm, icon, iconLg, iconXl)
- **Loading States**: Built-in spinner with optional custom loading text
- **Icon Support**: Left/right positioned icons with automatic sizing
- **Special Types**: Rounded buttons, floating action buttons, icon-only buttons
- **Design Token Integration**: All styling uses the centralized design token system
- **Accessibility**: Full keyboard navigation and screen reader support

## Basic Usage

```tsx
import { UnifiedButton } from '@/shared/ui/unified/UnifiedButton';

// Basic button
<UnifiedButton>Click me</UnifiedButton>

// With variant and size
<UnifiedButton variant="success" size="lg">
  Save Changes
</UnifiedButton>
```

## Variants

### Visual Variants

```tsx
// Primary actions
<UnifiedButton variant="default">Default</UnifiedButton>
<UnifiedButton variant="success">Success</UnifiedButton>
<UnifiedButton variant="info">Info</UnifiedButton>

// Secondary actions  
<UnifiedButton variant="outline">Outline</UnifiedButton>
<UnifiedButton variant="secondary">Secondary</UnifiedButton>
<UnifiedButton variant="ghost">Ghost</UnifiedButton>

// Status variants
<UnifiedButton variant="warning">Warning</UnifiedButton>
<UnifiedButton variant="destructive">Destructive</UnifiedButton>
<UnifiedButton variant="muted">Muted</UnifiedButton>

// Link style
<UnifiedButton variant="link">Link Button</UnifiedButton>
```

### Size Variants

```tsx
// Text button sizes
<UnifiedButton size="xs">Extra Small</UnifiedButton>
<UnifiedButton size="sm">Small</UnifiedButton>
<UnifiedButton size="default">Default</UnifiedButton>
<UnifiedButton size="lg">Large</UnifiedButton>
<UnifiedButton size="xl">Extra Large</UnifiedButton>

// Icon button sizes
<UnifiedButton size="iconXs" iconOnly><Icon /></UnifiedButton>
<UnifiedButton size="iconSm" iconOnly><Icon /></UnifiedButton>
<UnifiedButton size="icon" iconOnly><Icon /></UnifiedButton>
<UnifiedButton size="iconLg" iconOnly><Icon /></UnifiedButton>
<UnifiedButton size="iconXl" iconOnly><Icon /></UnifiedButton>
```

## Icon Integration

### Icons with Text

```tsx
import { Download, Upload, Settings } from 'lucide-react';

// Icon on the left (default)
<UnifiedButton icon={<Download className="h-4 w-4" />}>
  Download File
</UnifiedButton>

// Icon on the right
<UnifiedButton 
  icon={<Upload className="h-4 w-4" />} 
  iconPosition="right"
>
  Upload File
</UnifiedButton>
```

### Icon-Only Buttons

```tsx
import { Star, Plus, Settings } from 'lucide-react';

// Automatic size adjustment for icon-only buttons
<UnifiedButton iconOnly>
  <Star className="h-4 w-4" />
</UnifiedButton>

// Different sizes
<UnifiedButton size="iconSm" iconOnly>
  <Plus className="h-4 w-4" />
</UnifiedButton>

<UnifiedButton size="iconLg" iconOnly>
  <Settings className="h-5 w-5" />
</UnifiedButton>
```

## Loading States

```tsx
// Basic loading state
<UnifiedButton loading>Processing</UnifiedButton>

// Custom loading text
<UnifiedButton loading loadingText="Saving...">
  Save Changes
</UnifiedButton>

// Loading icon-only button
<UnifiedButton loading iconOnly>
  <Save className="h-4 w-4" />
</UnifiedButton>
```

## Special Button Types

### Rounded Buttons

```tsx
// Circular buttons
<UnifiedButton rounded>Rounded</UnifiedButton>

// Rounded icon button
<UnifiedButton rounded iconOnly>
  <Heart className="h-4 w-4" />
</UnifiedButton>
```

### Floating Action Buttons

```tsx
import { Plus } from 'lucide-react';

// Fixed positioned floating button
<UnifiedButton floating>
  <Plus className="h-5 w-5" />
</UnifiedButton>

// Floating buttons are automatically rounded and positioned
// in the bottom-right corner with elevated styling
```

## Real-World Examples

### Table Row Actions

```tsx
import { Edit, Share, Trash2 } from 'lucide-react';

<div className="flex gap-1">
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
```

### Form Actions

```tsx
<div className="flex justify-between">
  <UnifiedButton variant="ghost">Cancel</UnifiedButton>
  <div className="space-x-2">
    <UnifiedButton variant="outline">Save Draft</UnifiedButton>
    <UnifiedButton variant="default">Submit</UnifiedButton>
  </div>
</div>
```

### Status Actions

```tsx
<div className="flex gap-2">
  <UnifiedButton variant="success" size="sm">Approve</UnifiedButton>
  <UnifiedButton variant="warning" size="sm">Pending</UnifiedButton>
  <UnifiedButton variant="destructive" size="sm">Reject</UnifiedButton>
  <UnifiedButton variant="info" size="sm">Review</UnifiedButton>
</div>
```

### Dashboard Quick Actions

```tsx
import { Plus, Upload, RefreshCw, Bell } from 'lucide-react';

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
```

## Advanced Usage

### As Child Component (Links)

```tsx
import Link from 'next/link';

<UnifiedButton asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</UnifiedButton>
```

### Custom Styling

```tsx
// Additional custom classes
<UnifiedButton 
  variant="outline" 
  className="border-red-500 hover:bg-red-50"
>
  Custom Styled
</UnifiedButton>

// Combining multiple features
<UnifiedButton
  variant="success"
  size="lg"
  icon={<Download />}
  iconPosition="left"
  rounded
  className="shadow-lg"
>
  Download Report
</UnifiedButton>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ButtonVariant` | `"default"` | Visual style variant |
| `size` | `ButtonSize` | `"default"` | Size variant |
| `loading` | `boolean` | `false` | Show loading spinner and disable |
| `loadingText` | `string` | - | Custom text when loading |
| `disabled` | `boolean` | `false` | Disable the button |
| `icon` | `ReactNode` | - | Icon element to display |
| `iconPosition` | `"left" \| "right"` | `"left"` | Position of icon |
| `iconOnly` | `boolean` | `false` | Icon-only button with auto-sizing |
| `rounded` | `boolean` | `false` | Circular button styling |
| `floating` | `boolean` | `false` | Floating action button |
| `asChild` | `boolean` | `false` | Render as child component |
| `className` | `string` | - | Additional CSS classes |

### ButtonVariant Options

- `"default"` - Primary blue button
- `"destructive"` - Red button for dangerous actions
- `"outline"` - Outlined button with transparent background
- `"secondary"` - Gray secondary button
- `"ghost"` - Transparent button with hover effects
- `"link"` - Text-only link-style button
- `"success"` - Green button for positive actions
- `"warning"` - Orange button for warning actions
- `"info"` - Blue button for informational actions
- `"muted"` - Subtle gray button

### ButtonSize Options

**Text Buttons:**
- `"xs"` - Extra small (h-7)
- `"sm"` - Small (h-8)
- `"default"` - Default (h-9)
- `"lg"` - Large (h-11)
- `"xl"` - Extra large (h-12)

**Icon Buttons:**
- `"iconXs"` - Extra small icon (h-7 w-7)
- `"iconSm"` - Small icon (h-8 w-8)
- `"icon"` - Default icon (h-9 w-9)
- `"iconLg"` - Large icon (h-11 w-11)
- `"iconXl"` - Extra large icon (h-12 w-12)

## Design Token Integration

The UnifiedButton component uses the design token system for consistent styling:

- **Colors**: All variants use semantic color tokens
- **Spacing**: Sizes use standardized spacing tokens
- **Typography**: Text sizing follows typography tokens
- **States**: Hover, focus, and disabled states use state tokens
- **Animations**: Transitions use animation tokens

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Focus management with visible focus indicators
- Proper ARIA attributes
- Disabled state handling

## Migration from Standard Button

```tsx
// Before (standard Button)
import { Button } from '@/components/ui/button';

<Button variant="outline" size="sm">
  Click me
</Button>

// After (UnifiedButton)
import { UnifiedButton } from '@/shared/ui/unified/UnifiedButton';

<UnifiedButton variant="outline" size="sm">
  Click me
</UnifiedButton>
```

The UnifiedButton is fully compatible with the standard Button API while providing additional features and variants.