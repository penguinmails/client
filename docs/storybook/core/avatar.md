# Avatar Component

The Avatar component provides a consistent, accessible way to display user profile images, initials, or fallback content.

## 🏗️ Structure

The Avatar system consists of:

- **Avatar**: Main container component
- **AvatarImage**: Image element with fallback support
- **AvatarFallback**: Fallback content when image fails to load

## 📋 Props Table

### Avatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Avatar content |

### AvatarImage

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `undefined` | Image source URL |
| `alt` | `string` | `undefined` | Alt text for screen readers |
| `className` | `string` | `undefined` | Additional CSS classes |

### AvatarFallback

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Fallback content |

## 💡 Usage Examples

### Basic Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// With image and fallback
<Avatar>
  <AvatarImage src="/avatars/user.jpg" alt="John Doe" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// With initials only
<Avatar>
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

### User Profile with Details

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

<Card>
  <CardContent className="flex items-center gap-4 p-6">
    <Avatar className="h-16 w-16">
      <AvatarImage src="/avatars/sarah.jpg" alt="Sarah Johnson" />
      <AvatarFallback className="text-lg">SJ</AvatarFallback>
    </Avatar>
    <div>
      <h3 className="font-semibold">Sarah Johnson</h3>
      <p className="text-sm text-muted-foreground">sarah.johnson@company.com</p>
      <p className="text-xs text-muted-foreground">Marketing Manager</p>
    </div>
  </CardContent>
</Card>
```

### Team Members Grid

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const teamMembers = [
  { name: 'John Doe', email: 'john@company.com', avatar: '/avatars/john.jpg' },
  { name: 'Jane Smith', email: 'jane@company.com', avatar: '/avatars/jane.jpg' },
  { name: 'Bob Wilson', email: 'bob@company.com', avatar: null },
  { name: 'Alice Brown', email: 'alice@company.com', avatar: '/avatars/alice.jpg' },
]

<div className="grid grid-cols-2 gap-4">
  {teamMembers.map((member) => (
    <div key={member.email} className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={member.avatar || undefined} alt={member.name} />
        <AvatarFallback>
          {member.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{member.name}</p>
        <p className="text-sm text-muted-foreground">{member.email}</p>
      </div>
    </div>
  ))}
</div>
```

### Avatar with Status Indicator

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Online, Away, Busy } from 'lucide-react'

// Online status
<div className="relative">
  <Avatar>
    <AvatarImage src="/avatars/user.jpg" alt="User" />
    <AvatarFallback>U</AvatarFallback>
  </Avatar>
  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
</div>

// Away status
<div className="relative">
  <Avatar>
    <AvatarImage src="/avatars/user2.jpg" alt="User" />
    <AvatarFallback>U2</AvatarFallback>
  </Avatar>
  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 border-2 border-background" />
</div>
```

### Avatar Group

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Team avatar group
<div className="flex -space-x-2">
  <Avatar className="border-2 border-background">
    <AvatarImage src="/avatars/alice.jpg" alt="Alice" />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-background">
    <AvatarImage src="/avatars/bob.jpg" alt="Bob" />
    <AvatarFallback>BO</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-background">
    <AvatarImage src="/avatars/carol.jpg" alt="Carol" />
    <AvatarFallback>CA</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-background">
    <AvatarFallback>+5</AvatarFallback>
  </Avatar>
</div>
```

### Comment Thread

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<div className="space-y-4">
  <div className="flex gap-3">
    <Avatar className="h-8 w-8">
      <AvatarImage src="/avatars/user1.jpg" alt="User 1" />
      <AvatarFallback>U1</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">John Doe</span>
        <span className="text-xs text-muted-foreground">2 hours ago</span>
      </div>
      <p className="text-sm">This campaign looks great! The open rates are impressive.</p>
    </div>
  </div>
  
  <div className="flex gap-3">
    <Avatar className="h-8 w-8">
      <AvatarImage src="/avatars/user2.jpg" alt="User 2" />
      <AvatarFallback>U2</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">Jane Smith</span>
        <span className="text-xs text-muted-foreground">1 hour ago</span>
      </div>
      <p className="text-sm">Thanks! The A/B testing really helped optimize the subject lines.</p>
    </div>
  </div>
</div>
```

### Avatar with Custom Styling

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Large avatar for hero sections
<Avatar className="h-24 w-24">
  <AvatarImage src="/avatars/ceo.jpg" alt="CEO" />
  <AvatarFallback className="text-2xl">CEO</AvatarFallback>
</Avatar>

// Small avatar for notifications
<Avatar className="h-6 w-6">
  <AvatarImage src="/avatars/notification.jpg" alt="Notification" />
  <AvatarFallback className="text-xs">N</AvatarFallback>
</Avatar>
```

### Avatar with Click Handler

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'

function UserAvatar({ user }) {
  const navigate = useNavigate()

  return (
    <Avatar 
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate(`/users/${user.id}`)}
    >
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>
        {user.name.split(' ').map(n => n[0]).join('')}
      </AvatarFallback>
    </Avatar>
  )
}
```

## ♿ Accessibility

- Requires descriptive `alt` text for AvatarImage
- AvatarFallback provides text-based alternative
- Maintains minimum touch target size (44px)
- Proper focus management for interactive avatars
- Screen reader friendly with semantic structure

## 🎯 Design Guidelines

- Use initials from first and last name for fallback
- Maintain consistent sizing within context
- Use border-2 border-background for avatar groups
- Provide meaningful alt text that describes the person
- Use appropriate size for context (small for lists, large for profiles)
- Consider using status indicators for online presence
- Don't use Avatar as a button without proper interaction patterns
- Ensure fallback initials are readable and not confusing

## 🔗 Related Components

- [Card](./card.md) - For profile containers
- [Badge](./badge.md) - For status indicators
- [Button](./button.md) - For profile actions
