# Badge Component

The Badge component provides small, labeled elements for highlighting status, categories, counts, and other metadata.

## 🎨 Variants

### Visual Styles

- **Default**: Primary brand colors for active/selected states
- **Secondary**: Muted colors for less prominent information
- **Destructive**: Error states and important warnings
- **Outline**: Border-only style for subtle indicators

## 📋 Props Table

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | Visual style variant |
| `asChild` | `boolean` | `false` | Render as child component using Slot |
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Badge content |

## 💡 Usage Examples

### Status Indicators

```tsx
import { Badge } from '@/components/ui/badge'

// Active status
<Badge>Active</Badge>
<Badge variant="default">Active</Badge>

// Success state
<Badge variant="secondary">Completed</Badge>

// Error state
<Badge variant="destructive">Failed</Badge>

// Warning state
<Badge variant="outline">Pending</Badge>
```

### Campaign Status Badges

```tsx
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Pause, AlertCircle } from 'lucide-react'

<div className="space-y-2">
  <div className="flex items-center gap-2">
    <CheckCircle className="h-4 w-4 text-green-500" />
    <Badge variant="secondary">Running</Badge>
  </div>
  <div className="flex items-center gap-2">
    <Clock className="h-4 w-4 text-yellow-500" />
    <Badge variant="outline">Scheduled</Badge>
  </div>
  <div className="flex items-center gap-2">
    <Pause className="h-4 w-4 text-blue-500" />
    <Badge variant="default">Paused</Badge>
  </div>
  <div className="flex items-center gap-2">
    <AlertCircle className="h-4 w-4 text-red-500" />
    <Badge variant="destructive">Error</Badge>
  </div>
</div>
```

### User Role Badges

```tsx
import { Badge } from '@/components/ui/badge'

<div className="space-y-2">
  <div className="flex items-center gap-2">
    <span>John Doe</span>
    <Badge variant="destructive">Admin</Badge>
  </div>
  <div className="flex items-center gap-2">
    <span>Jane Smith</span>
    <Badge variant="default">Editor</Badge>
  </div>
  <div className="flex items-center gap-2">
    <span>Bob Wilson</span>
    <Badge variant="outline">Viewer</Badge>
  </div>
</div>
```

### Campaign Type Badges

```tsx
import { Badge } from '@/components/ui/badge'

<div className="flex flex-wrap gap-2">
  <Badge>Newsletter</Badge>
  <Badge variant="secondary">Product Launch</Badge>
  <Badge variant="outline">Announcement</Badge>
  <Badge variant="destructive">Retention</Badge>
</div>
```

### Count Badges

```tsx
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

<button className="relative">
  <Bell className="h-5 w-5" />
  <Badge 
    variant="destructive" 
    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
  >
    3
  </Badge>
</button>
```

### With Custom Content

```tsx
import { Badge } from '@/components/ui/badge'

// With custom styling
<Badge className="bg-green-100 text-green-800 border-green-200">
  ✓ Verified
</Badge>

// With icon
<Badge variant="outline" className="gap-1">
  <CheckCircle className="h-3 w-3" />
  Approved
</Badge>
```

### Card Integration

```tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Email Campaign</CardTitle>
      <Badge variant="secondary">Draft</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Last edited 2 hours ago
    </p>
    <div className="flex gap-2 mt-2">
      <Badge variant="outline">Marketing</Badge>
      <Badge variant="outline">Newsletter</Badge>
    </div>
  </CardContent>
</Card>
```

### Notification Badges

```tsx
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<div className="space-y-3">
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="/avatars/alice.jpg" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="text-sm font-medium">Alice Johnson</p>
      <p className="text-xs text-muted-foreground">Sent you a message</p>
    </div>
    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
      2
    </Badge>
  </div>
</div>
```

### Progress Badges

```tsx
import { Badge } from '@/components/ui/badge'

// Step indicators
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Badge>1. Create</Badge>
    <span className="text-sm text-muted-foreground">Setup campaign</span>
  </div>
  <div className="flex items-center gap-2">
    <Badge variant="default">2. Design</Badge>
    <span className="text-sm text-muted-foreground">Create email template</span>
  </div>
  <div className="flex items-center gap-2">
    <Badge variant="outline">3. Review</Badge>
    <span className="text-sm text-muted-foreground">Preview and approve</span>
  </div>
</div>
```

## ♿ Accessibility

- Maintains sufficient contrast across all variants
- Screen reader friendly with semantic text content
- Proper sizing for touch targets (minimum 44px)
- Color is not the only indicator of meaning
- Supports custom ARIA labels when needed

## 🎯 Design Guidelines

- Keep text concise and scannable (typically 1-3 words)
- Use `destructive` only for critical states and errors
- Use `secondary` for completed or successful states
- Use `outline` for neutral or pending states
- Use `default` for primary or active states
- Don't use color alone to convey meaning
- Consider using icons for additional context
- Position badges near the content they describe
- Avoid overusing badges - they should highlight important information

## 🔗 Related Components

- [Card](./card.md) - For badge containers
- [Avatar](./avatar.md) - For user indicators
- [Button](./button.md) - For action elements
