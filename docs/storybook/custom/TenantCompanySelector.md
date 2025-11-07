# TenantCompanySelector Component

The TenantCompanySelector provides a comprehensive interface for selecting tenant and company context in multi-tenant applications. It integrates with the authentication system and provides role-based access management.

## 🏗️ Component Architecture

- **Context Management**: Integrates with AuthContext for user authentication state
- **Access Control**: Uses custom hooks for tenant and company access validation
- **Auto-selection**: Automatically selects the first available tenant/company
- **Real-time Updates**: Refreshes context with manual refresh capability

## 📋 Props Table

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCompanySelector` | `boolean` | `true` | Whether to show company selection dropdown |
| `onTenantChange` | `function` | `undefined` | Callback when tenant selection changes |
| `onCompanyChange` | `function` | `undefined` | Callback when company selection changes |
| `className` | `string` | `undefined` | Additional CSS classes |

## 💡 Usage Examples

### Basic Usage

```tsx
import { TenantCompanySelector } from '@/components/auth/TenantCompanySelector'

// Simple selector with default behavior
<TenantCompanySelector />

// With change handlers
<TenantCompanySelector 
  onTenantChange={(tenantId) => console.log('Tenant:', tenantId)}
  onCompanyChange={(companyId) => console.log('Company:', companyId)}
/>

// Hide company selector
<TenantCompanySelector showCompanySelector={false} />
```

### Integration with Application State

```tsx
import { useState } from 'react'
import { TenantCompanySelector } from '@/components/auth/TenantCompanySelector'

function AppContextProvider() {
  const [context, setContext] = useState({
    tenantId: null,
    companyId: null,
  })

  return (
    <div className="space-y-4">
      <TenantCompanySelector
        onTenantChange={(tenantId) => 
          setContext(prev => ({ ...prev, tenantId, companyId: null }))
        }
        onCompanyChange={(companyId) => 
          setContext(prev => ({ ...prev, companyId }))
        }
      />
      <div className="text-sm text-muted-foreground">
        Current Context: {context.tenantId} / {context.companyId}
      </div>
    </div>
  )
}
```

### With Custom Styling

```tsx
import { TenantCompanySelector } from '@/components/auth/TenantCompanySelector'

<div className="max-w-md">
  <TenantCompanySelector 
    className="shadow-lg border-2"
  />
</div>
```

### In Settings Page

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TenantCompanySelector } from '@/components/auth/TenantCompanySelector'
import { Settings } from 'lucide-react'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Context</CardTitle>
        </CardHeader>
        <CardContent>
          <TenantCompanySelector />
        </CardContent>
      </Card>
      
      {/* Other settings sections */}
    </div>
  )
}
```

### With Context Summary

```tsx
import { useAuth } from '@/context/AuthContext'
import { TenantCompanySelector } from '@/components/auth/TenantCompanySelector'

function ContextDisplay() {
  const { selectedTenantId, selectedCompanyId } = useAuth()
  
  return (
    <div className="space-y-4">
      <TenantCompanySelector />
      
      {/* Context Summary */}
      {(selectedTenantId || selectedCompanyId) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Current Context</h3>
            <div className="text-sm space-y-1">
              {selectedTenantId && (
                <div>Tenant: {selectedTenantId}</div>
              )}
              {selectedCompanyId && (
                <div>Company: {selectedCompanyId}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

## ♿ Accessibility

- Proper label associations for form controls
- Loading states with appropriate indicators
- Error states clearly communicated
- Keyboard navigation support
- Screen reader announcements for selection changes
- Sufficient color contrast

## 🎯 Design Guidelines

- Use in multi-tenant applications with user context switching
- Show company selector only when tenant supports companies
- Provide clear visual feedback for loading and error states
- Use the refresh button to update context from the server
- Consider showing role badges for staff users
- Display context summary for user confirmation
- Handle empty states gracefully

## 🔗 Related Components

- [Card](./core/card.md) - Main container component
- [Button](./core/button.md) - For refresh actions
- [Badge](./core/badge.md) - For role indicators
- [Select](./core/select.md) - For dropdown selections

## 🔧 Dependencies

- **@/context/AuthContext**: Authentication context provider
- **@/hooks/useEnhancedAuth**: Custom hooks for access control
- **@/components/ui/select**: Select component for dropdowns
- **sonner**: Toast notifications for user feedback
