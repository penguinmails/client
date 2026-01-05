# UnifiedErrorBoundary

A unified error boundary component for consistent error handling across the application.

## Features

- **Multiple Variants**: Default, minimal, and detailed error displays
- **Customizable Actions**: Retry, home, and reload buttons
- **Error Logging**: Built-in error logging with custom callback support
- **Development Mode**: Detailed error information in development
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Fallback Support**: Custom fallback components

## Usage

### Basic Error Boundary

```tsx
import { UnifiedErrorBoundary } from '@/shared/ui/unified';

// Wrap components that might error
<UnifiedErrorBoundary>
  <MyComponent />
</UnifiedErrorBoundary>

// With retry functionality
<UnifiedErrorBoundary 
  showRetry 
  onRetry={() => window.location.reload()}
>
  <MyComponent />
</UnifiedErrorBoundary>
```

### Different Variants

```tsx
// Minimal variant (just an alert)
<UnifiedErrorBoundary variant="minimal">
  <MyComponent />
</UnifiedErrorBoundary>

// Detailed variant (shows error details in dev)
<UnifiedErrorBoundary variant="detailed" showRetry showHome>
  <MyComponent />
</UnifiedErrorBoundary>

// Default variant with custom actions
<UnifiedErrorBoundary 
  showRetry 
  showHome 
  showReload
  title="Dashboard Error"
  message="Unable to load dashboard data"
>
  <MyDashboard />
</UnifiedErrorBoundary>
```

### Custom Error Handling

```tsx
// With custom error callback
<UnifiedErrorBoundary 
  onError={(error, errorInfo) => {
    // Send to error tracking service
    console.error('Component error:', error, errorInfo);
  }}
  onRetry={() => {
    // Custom retry logic
    refetchData();
  }}
>
  <MyComponent />
</UnifiedErrorBoundary>

// With custom fallback
<UnifiedErrorBoundary 
  fallback={
    <div className="text-center py-8">
      <h2>Something went wrong</h2>
      <p>Please contact support</p>
    </div>
  }
>
  <MyComponent />
</UnifiedErrorBoundary>
```

## Props

### UnifiedErrorBoundary

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Components to wrap with error boundary |
| `fallback` | `ReactNode` | - | Custom fallback component |
| `variant` | `"default" \| "minimal" \| "detailed"` | `"default"` | Error display variant |
| `showRetry` | `boolean` | `true` | Show retry button |
| `showHome` | `boolean` | `false` | Show home button |
| `showReload` | `boolean` | `false` | Show reload button |
| `title` | `string` | `"Something went wrong"` | Custom error title |
| `message` | `string` | - | Custom error message |
| `onRetry` | `() => void` | - | Callback when retry is clicked |
| `onError` | `(error, errorInfo) => void` | - | Callback when error occurs |
| `className` | `string` | - | Additional CSS classes |

### UnifiedErrorFallback

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | `string` | - | Error message to display |
| `retry` | `() => void` | - | Retry callback function |
| `className` | `string` | - | Additional CSS classes |
| `variant` | `"default" \| "minimal"` | `"default"` | Display variant |

## Variants

### Default Variant

Full error card with title, message, and action buttons.

```tsx
<UnifiedErrorBoundary>
  <MyComponent />
</UnifiedErrorBoundary>
```

### Minimal Variant

Simple alert with inline retry button.

```tsx
<UnifiedErrorBoundary variant="minimal" showRetry>
  <MyComponent />
</UnifiedErrorBoundary>
```

### Detailed Variant

Includes error stack trace in development mode.

```tsx
<UnifiedErrorBoundary variant="detailed" showRetry showHome>
  <MyComponent />
</UnifiedErrorBoundary>
```

## Examples

### Page-Level Error Boundary

```tsx
// Wrap entire page
export default function DashboardPage() {
  return (
    <UnifiedErrorBoundary 
      showRetry 
      showHome 
      title="Dashboard Error"
      onError={(error) => {
        // Log to error service
        errorService.log(error);
      }}
    >
      <DashboardContent />
    </UnifiedErrorBoundary>
  );
}
```

### Component-Level Error Boundary

```tsx
// Wrap specific components
function CampaignsList() {
  return (
    <UnifiedErrorBoundary 
      variant="minimal" 
      showRetry
      onRetry={() => refetch()}
    >
      <CampaignsTable />
    </UnifiedErrorBoundary>
  );
}
```

### Form Error Boundary

```tsx
// Wrap forms with custom retry
function ContactForm() {
  const [formKey, setFormKey] = useState(0);
  
  return (
    <UnifiedErrorBoundary 
      showRetry
      onRetry={() => setFormKey(prev => prev + 1)}
      title="Form Error"
      message="There was an error with the form. Please try again."
    >
      <form key={formKey}>
        <FormFields />
      </form>
    </UnifiedErrorBoundary>
  );
}
```

### Settings Error Boundary

```tsx
// Settings with fallback to safe mode
function SettingsPanel() {
  return (
    <UnifiedErrorBoundary 
      fallback={
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Settings temporarily unavailable. 
            <Button variant="link" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </AlertDescription>
        </Alert>
      }
    >
      <AdvancedSettings />
    </UnifiedErrorBoundary>
  );
}
```

## Error Fallback Component

For simple inline error states:

```tsx
import { UnifiedErrorFallback } from '@/shared/ui/unified';

// Simple error message with retry
<UnifiedErrorFallback 
  error="Failed to load data" 
  retry={() => refetch()} 
/>

// Minimal variant
<UnifiedErrorFallback 
  error="Connection error" 
  retry={() => reconnect()} 
  variant="minimal" 
/>
```

## Migration Guide

### From Custom Error Boundaries

```tsx
// Before (custom error boundary)
class MyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

// After (UnifiedErrorBoundary)
<UnifiedErrorBoundary showRetry>
  <MyComponent />
</UnifiedErrorBoundary>
```

### From Try-Catch Patterns

```tsx
// Before (try-catch with manual error state)
function MyComponent() {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return <Content />;
}

// After (UnifiedErrorBoundary)
<UnifiedErrorBoundary variant="minimal">
  <MyComponent />
</UnifiedErrorBoundary>
```