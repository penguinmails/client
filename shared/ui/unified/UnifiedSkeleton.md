# UnifiedSkeleton

A unified skeleton component for consistent loading placeholders across the application.

## Features

- **Multiple Variants**: Card, list, table, stats, form, and basic skeletons
- **Configurable Count**: Render multiple skeleton items
- **Avatar Support**: Optional avatar/icon placeholders
- **Action Placeholders**: Optional action button placeholders
- **Custom Dimensions**: Custom height and width support
- **Animation Options**: Pulse, wave, or no animation
- **Accessibility**: Proper ARIA labels and loading states

## Usage

### Basic Skeleton

```tsx
import { UnifiedSkeleton } from '@/shared/ui/unified';

// Simple skeleton
<UnifiedSkeleton />

// Custom dimensions
<UnifiedSkeleton height="20px" width="200px" />

// Multiple items
<UnifiedSkeleton count={3} />
```

### Skeleton Variants

```tsx
// Card skeleton
<UnifiedSkeleton variant="card" />

// List skeleton with avatars
<UnifiedSkeleton 
  variant="list" 
  count={5} 
  showAvatar 
  showActions 
/>

// Table skeleton
<UnifiedSkeleton variant="table" count={10} showActions />

// Stats cards skeleton
<UnifiedSkeleton variant="stats" count={4} showAvatar />

// Form skeleton
<UnifiedSkeleton variant="form" showActions />
```

### Animation Options

```tsx
// Pulse animation (default)
<UnifiedSkeleton animation="pulse" />

// Wave animation
<UnifiedSkeleton animation="wave" />

// No animation
<UnifiedSkeleton animation="none" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `SkeletonVariant` | `"default"` | Skeleton type (default, card, list, table, stats, form) |
| `count` | `number` | `1` | Number of skeleton items to render |
| `showAvatar` | `boolean` | `false` | Show avatar/icon placeholder |
| `showActions` | `boolean` | `false` | Show action buttons placeholder |
| `height` | `string` | - | Custom height for skeleton items |
| `width` | `string` | - | Custom width for skeleton items |
| `animation` | `"pulse" \| "wave" \| "none"` | `"pulse"` | Animation type |
| `className` | `string` | - | Additional CSS classes |

## Variants

### Default Variant

Basic rectangular skeleton for general content.

```tsx
<UnifiedSkeleton />
<UnifiedSkeleton count={3} />
```

### Card Variant

Skeleton for card-like content with header and body.

```tsx
<UnifiedSkeleton variant="card" />
<UnifiedSkeleton variant="card" count={3} showActions />
```

### List Variant

Skeleton for list items with optional avatars and actions.

```tsx
<UnifiedSkeleton variant="list" count={5} />
<UnifiedSkeleton variant="list" count={3} showAvatar showActions />
```

### Table Variant

Skeleton for table rows with columns and optional actions.

```tsx
<UnifiedSkeleton variant="table" count={8} />
<UnifiedSkeleton variant="table" count={5} showActions />
```

### Stats Variant

Skeleton for statistics cards in a grid layout.

```tsx
<UnifiedSkeleton variant="stats" count={4} />
<UnifiedSkeleton variant="stats" count={4} showAvatar />
```

### Form Variant

Skeleton for form fields with labels and optional actions.

```tsx
<UnifiedSkeleton variant="form" />
<UnifiedSkeleton variant="form" showActions />
```

## Examples

### Loading States

```tsx
// Page loading
function DashboardPage() {
  const { data, loading } = useDashboard();
  
  if (loading) {
    return (
      <div className="space-y-6">
        <UnifiedSkeleton variant="stats" count={4} showAvatar />
        <UnifiedSkeleton variant="table" count={8} showActions />
      </div>
    );
  }
  
  return <DashboardContent data={data} />;
}

// Card loading
function CampaignCard({ campaign }) {
  if (!campaign) {
    return <UnifiedSkeleton variant="card" showActions />;
  }
  
  return <Card>{/* campaign content */}</Card>;
}
```

### List Loading

```tsx
// User list loading
function UsersList() {
  const { users, loading } = useUsers();
  
  return (
    <div>
      {loading ? (
        <UnifiedSkeleton 
          variant="list" 
          count={6} 
          showAvatar 
          showActions 
        />
      ) : (
        users.map(user => <UserItem key={user.id} user={user} />)
      )}
    </div>
  );
}

// Campaign list with mixed loading
function CampaignsList() {
  const { campaigns, loading } = useCampaigns();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? (
        <UnifiedSkeleton variant="card" count={6} showActions />
      ) : (
        campaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))
      )}
    </div>
  );
}
```

### Form Loading

```tsx
// Settings form loading
function SettingsForm() {
  const { settings, loading } = useSettings();
  
  if (loading) {
    return <UnifiedSkeleton variant="form" showActions />;
  }
  
  return (
    <form>
      <FormFields settings={settings} />
    </form>
  );
}

// Profile form with partial loading
function ProfileForm() {
  const { profile, loading } = useProfile();
  
  return (
    <div className="space-y-4">
      {loading ? (
        <>
          <UnifiedSkeleton height="40px" />
          <UnifiedSkeleton height="40px" />
          <UnifiedSkeleton height="100px" />
          <UnifiedSkeleton height="36px" width="120px" />
        </>
      ) : (
        <ProfileFields profile={profile} />
      )}
    </div>
  );
}
```

### Table Loading

```tsx
// Data table loading
function DataTable() {
  const { data, loading } = useTableData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <UnifiedSkeleton variant="table" count={10} showActions />
        ) : (
          <Table>
            <TableBody>
              {data.map(row => <TableRow key={row.id} {...row} />)}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

### Dashboard Loading

```tsx
// Full dashboard loading
function Dashboard() {
  const { stats, campaigns, users, loading } = useDashboard();
  
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Stats cards */}
        <UnifiedSkeleton variant="stats" count={4} showAvatar />
        
        {/* Recent campaigns */}
        <div>
          <UnifiedSkeleton height="24px" width="200px" className="mb-4" />
          <UnifiedSkeleton variant="list" count={5} showAvatar showActions />
        </div>
        
        {/* User table */}
        <div>
          <UnifiedSkeleton height="24px" width="150px" className="mb-4" />
          <UnifiedSkeleton variant="table" count={8} showActions />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      <RecentCampaigns campaigns={campaigns} />
      <UsersTable users={users} />
    </div>
  );
}
```

## Migration Guide

### From Custom Skeletons

```tsx
// Before (custom skeleton)
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
</div>

// After (UnifiedSkeleton)
<UnifiedSkeleton variant="form" />
```

### From Loading Components

```tsx
// Before (custom loading component)
function LoadingCard() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </Card>
  );
}

// After (UnifiedSkeleton)
<UnifiedSkeleton variant="card" showActions />
```

### From Conditional Rendering

```tsx
// Before (manual skeleton rendering)
{loading ? (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
) : (
  <UsersList users={users} />
)}

// After (UnifiedSkeleton)
{loading ? (
  <UnifiedSkeleton variant="list" count={5} showAvatar />
) : (
  <UsersList users={users} />
)}
```