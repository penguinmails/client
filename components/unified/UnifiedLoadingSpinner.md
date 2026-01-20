# UnifiedLoadingSpinner

A unified loading spinner component for consistent loading states across the application.

## Features

- **Design Token Integration**: Uses design tokens for consistent styling
- **Multiple Variants**: Primary, secondary, success, warning, error, and white variants
- **Size Options**: xs, sm, default, lg, xl sizes
- **Text Support**: Optional loading text display
- **Overlay Mode**: Can cover parent container with backdrop
- **Custom Icons**: Support for custom loading icons
- **Accessibility**: Proper ARIA labels and screen reader support

## Usage

### Basic Spinner

```tsx
import { UnifiedLoadingSpinner } from '@/components/unified';

// Simple spinner
<UnifiedLoadingSpinner />

// With custom size and variant
<UnifiedLoadingSpinner size="lg" variant="primary" />
```

### With Text

```tsx
// Spinner with text below
<UnifiedLoadingSpinner 
  text="Loading campaigns..." 
  showText 
/>

// Centered spinner with text
<UnifiedLoadingSpinner 
  text="Please wait..." 
  showText 
  centered 
/>
```

### Overlay Mode

```tsx
// Overlay that covers parent container
<div className="relative">
  <MyContent />
  {loading && (
    <UnifiedLoadingSpinner 
      overlay 
      text="Saving changes..." 
      showText 
    />
  )}
</div>
```

### Custom Icon

```tsx
import { Loader, RefreshCw } from 'lucide-react';

// Custom loading icon
<UnifiedLoadingSpinner 
  icon={RefreshCw}
  text="Refreshing data..."
  showText
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `SpinnerSize` | `"default"` | Size variant (xs, sm, default, lg, xl) |
| `variant` | `SpinnerVariant` | `"default"` | Visual variant (default, primary, secondary, success, warning, error, white) |
| `icon` | `LucideIcon` | `Loader2` | Custom icon component |
| `text` | `string` | `"Loading..."` | Loading text to display |
| `showText` | `boolean` | `false` | Show text below spinner |
| `centered` | `boolean` | `false` | Center the spinner in its container |
| `overlay` | `boolean` | `false` | Overlay mode (covers parent container) |
| `className` | `string` | - | Additional CSS classes |

## Design Tokens

The component uses the following design tokens:

- `spinnerTokens.sizes` - Size variants
- `spinnerTokens.variants` - Color variants
- `spinnerTokens.base` - Base animation classes

## Examples

### Loading States

```tsx
// Button loading state
<Button disabled={loading}>
  {loading && <UnifiedLoadingSpinner size="sm" variant="white" />}
  {loading ? "Saving..." : "Save Changes"}
</Button>

// Page loading
<div className="flex justify-center py-8">
  <UnifiedLoadingSpinner 
    size="lg" 
    text="Loading dashboard..." 
    showText 
    centered 
  />
</div>

// Form submission overlay
<form className="relative">
  <FormFields />
  {submitting && (
    <UnifiedLoadingSpinner 
      overlay 
      text="Submitting form..." 
      showText 
    />
  )}
</form>
```

### Different Contexts

```tsx
// Success loading (e.g., after successful action)
<UnifiedLoadingSpinner 
  variant="success" 
  text="Processing..." 
  showText 
/>

// Error retry loading
<UnifiedLoadingSpinner 
  variant="error" 
  text="Retrying..." 
  showText 
/>

// Primary action loading
<UnifiedLoadingSpinner 
  variant="primary" 
  size="lg" 
  text="Creating campaign..." 
  showText 
/>
```

## Migration Guide

### From Custom Spinners

```tsx
// Before (custom spinner)
<div className="flex items-center justify-center">
  <Loader2 className="h-6 w-6 animate-spin text-primary" />
  <span className="ml-2 text-sm">Loading...</span>
</div>

// After (UnifiedLoadingSpinner)
<UnifiedLoadingSpinner 
  size="lg" 
  variant="primary" 
  text="Loading..." 
  showText 
  centered 
/>
```

### From Loading States

```tsx
// Before (inline loading)
{loading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
) : (
  <Content />
)}

// After (UnifiedLoadingSpinner)
{loading ? (
  <UnifiedLoadingSpinner text="Loading content..." showText />
) : (
  <Content />
)}
```