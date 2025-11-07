# Card Component

The Card component provides a flexible container for grouping related content with consistent spacing, borders, and shadows.

## 🏗️ Structure

The Card system consists of several sub-components that work together:

- **Card**: Main container component
- **CardHeader**: Top section for titles and actions
- **CardTitle**: Card title element
- **CardDescription**: Supporting description text
- **CardContent**: Main content area
- **CardFooter**: Bottom section for actions
- **CardAction**: Action buttons aligned to the right

## 📋 Props Table

### Card

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### CardHeader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### CardTitle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### CardDescription

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### CardContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### CardFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### CardAction

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

## 💡 Usage Examples

### Basic Card

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting text that provides context</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
</Card>
```

### Card with Actions

```tsx
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

<Card>
  <CardHeader>
    <CardTitle>Project Status</CardTitle>
    <CardDescription>Current project overview</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="size-4" />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Progress</span>
        <span>75%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">View Details</Button>
  </CardFooter>
</Card>
```

### Product Card

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

<Card className="w-[300px]">
  <CardHeader>
    <div className="aspect-video bg-muted rounded-md mb-2" />
    <CardTitle>Premium Template</CardTitle>
    <CardDescription>Professional email template for marketing campaigns</CardDescription>
    <div className="flex gap-2 mt-2">
      <Badge variant="secondary">Email</Badge>
      <Badge variant="outline">Template</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$29</div>
    <p className="text-muted-foreground text-sm">One-time purchase</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Add to Cart</Button>
  </CardFooter>
</Card>
```

### Settings Card

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

<Card>
  <CardHeader>
    <CardTitle>Email Notifications</CardTitle>
    <CardDescription>Receive notifications about campaign performance</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">Campaign Updates</div>
        <div className="text-sm text-muted-foreground">Get notified when campaigns start/stop</div>
      </div>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">Weekly Reports</div>
        <div className="text-sm text-muted-foreground">Receive weekly performance summaries</div>
      </div>
      <Switch />
    </div>
  </CardContent>
</Card>
```

### User Profile Card

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

<Card>
  <CardHeader className="flex flex-row items-center gap-4">
    <Avatar className="h-12 w-12">
      <AvatarImage src="/avatars/user.jpg" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
    <div>
      <CardTitle>John Doe</CardTitle>
      <CardDescription>john.doe@company.com</CardDescription>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Status</span>
        <span className="text-green-600">Active</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Role</span>
        <span>Administrator</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Last Login</span>
        <span>2 hours ago</span>
      </div>
    </div>
  </CardContent>
</Card>
```

## ♿ Accessibility

- Uses semantic HTML structure (div with appropriate ARIA roles)
- Supports screen readers with proper heading hierarchy
- Maintains sufficient color contrast for all text elements
- Card header automatically adjusts grid layout for actions

## 🎯 Design Guidelines

- Use CardHeader for title and description pairing
- CardAction should contain buttons or icons aligned right
- Use CardFooter for primary actions that span the full width
- Maintain consistent spacing using the built-in padding (px-6)
- Use appropriate heading levels (h2, h3, etc.) in CardTitle for SEO
- Keep CardDescriptions concise and helpful

## 🔗 Related Components

- [Button](./button.md) - For card actions
- [Avatar](./avatar.md) - For user profile cards
- [Badge](./badge.md) - For status indicators
- [Switch](./switch.md) - For settings toggles
