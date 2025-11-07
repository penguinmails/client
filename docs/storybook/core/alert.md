# Alert Component

The Alert component provides contextual feedback messages with appropriate styling for different types of notifications and alerts.

## 🏗️ Structure

The Alert system consists of:

- **Alert**: Main container component
- **AlertTitle**: Heading for the alert message
- **AlertDescription**: Detailed description or content

## 📋 Props Table

### Alert

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive"` | `"default"` | Visual style variant |
| `className` | `string` | `undefined` | Additional CSS classes |
| `role` | `string` | `"alert"` | ARIA role attribute |

### AlertTitle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### AlertDescription

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

## 💡 Usage Examples

### Basic Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the CLI.
  </AlertDescription>
</Alert>
```

### Default Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Your account has been successfully verified. You can now access all features.
  </AlertDescription>
</Alert>
```

### Destructive Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again to continue.
  </AlertDescription>
</Alert>
```

### Form Validation Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Validation Error</AlertTitle>
  <AlertDescription>
    Please check the following fields:
    <ul className="mt-2 list-disc list-inside">
      <li>Email address is required</li>
      <li>Password must be at least 8 characters</li>
    </ul>
  </AlertDescription>
</Alert>
```

### Success Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

<Alert>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully. The campaign will be updated shortly.
  </AlertDescription>
</Alert>
```

### Warning Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

<Alert>
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    You're approaching your email sending limit. Consider upgrading your plan to continue sending campaigns.
  </AlertDescription>
</Alert>
```

### Alert with Action

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

<Alert>
  <AlertTriangle className="h-4 w-4" />
  <div className="flex-1">
    <AlertTitle>New Update Available</AlertTitle>
    <AlertDescription>
      A new version of the application is available with improved performance and new features.
    </AlertDescription>
  </div>
  <Button variant="outline" size="sm">
    Update Now
  </Button>
</Alert>
```

### Inline Alert

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert'

// For use within forms or content
<Alert>
  <AlertDescription>
    **Note:** Changes you make here will affect all users in your organization.
  </AlertDescription>
</Alert>
```

### Dismissible Alert (Custom)

```tsx
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

function DismissibleAlert() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Alert className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        This alert can be dismissed by clicking the X button.
      </AlertDescription>
    </Alert>
  )
}
```

## ♿ Accessibility

- Automatically sets `role="alert"` for screen reader announcements
- Destructive variant uses semantic color contrast for color blindness
- Icons provide additional visual cues beyond color
- Structure supports keyboard navigation
- Content is announced immediately by screen readers

## 🎯 Design Guidelines

- Use `destructive` variant for errors, warnings, and critical information
- Use `default` variant for informational messages and success states
- Keep messages concise and actionable
- Include specific guidance on how to resolve issues
- Use appropriate icons to reinforce the message type
- Position alerts near the content they relate to
- Don't overuse alerts - they should grab attention for important information

## 🔗 Related Components

- [Button](./button.md) - For alert actions
- [Dialog](./dialog.md) - For modal confirmations
- [Input](./input.md) - For form validation errors
