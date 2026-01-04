# System Health Monitoring

This directory contains the new system health monitoring functionality that was moved from the auth context to a dedicated provider.

## Overview

The system health functionality has been refactored to provide better separation of concerns and improved user notifications. System health checks are now handled by a dedicated context that provides toast notifications when issues are detected.

## Key Features

### Adaptive Health Checking
- **Smart Intervals**: Different check frequencies based on system status
  - **Healthy**: Every 5 minutes (reduces API load)
  - **Degraded**: Every 1 minute (closer monitoring)
  - **Unhealthy/Unknown**: Every 30 seconds (rapid detection of recovery)
- **Server-side Caching**: Redis caching prevents multiple clients from hitting the endpoint
- **Client-side Caching**: Local cache prevents duplicate requests within TTL periods
- **Page Visibility Optimization**: Checks pause when tab is not active
- **DDOS Prevention**: Multi-layer caching prevents excessive API calls

### Automatic Health Checks
- Periodic health checks with adaptive intervals
- Initial health check on app mount
- Manual health check capability
- Status change detection and notifications

### Status Levels
- **Healthy** (green) - All systems operating normally
- **Degraded** (yellow) - Some services experiencing issues
- **Unhealthy** (red) - Significant system issues detected
- **Unknown** (gray) - Unable to determine system status

### Notifications
- Toast notifications for status changes
- Different notification types based on severity
- Retry actions for failed checks
- Detailed error information

## Usage

### Using the System Health Hook

```tsx
import { useSystemHealth } from '@/shared/context/system-health-context';

function MyComponent() {
  const { systemHealth, checkSystemHealth, isChecking } = useSystemHealth();

  return (
    <div>
      <p>System Status: {systemHealth.status}</p>
      <p>Last Check: {systemHealth.lastCheck?.toLocaleString()}</p>
      {systemHealth.details && <p>Details: {systemHealth.details}</p>}
      <button onClick={checkSystemHealth} disabled={isChecking}>
        {isChecking ? 'Checking...' : 'Check Health'}
      </button>
    </div>
  );
}
```

### Using the System Health Indicator Component

```tsx
import { SystemHealthIndicator } from '@/shared/components/SystemHealthIndicator';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <SystemHealthIndicator showDetails={true} />
      {/* Rest of dashboard content */}
    </div>
  );
}
```

### Using the Simple Status Hook

```tsx
import { useSystemHealthStatus } from '@/shared/components/SystemHealthIndicator';

function HealthStatusBadge() {
  const { isHealthy, status } = useSystemHealthStatus();
  
  return (
    <Badge variant={isHealthy ? 'default' : 'destructive'}>
      System {status}
    </Badge>
  );
}
```

## Integration

The SystemHealthProvider is automatically included in the app through the main Providers component:

```tsx
// components/common/providers.tsx
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SystemHealthProvider>  {/* ← Automatically included */}
        <ThemeProvider>
          <ClientPreferencesProvider>{children}</ClientPreferencesProvider>
        </ThemeProvider>
      </SystemHealthProvider>
    </QueryClientProvider>
  );
}
```

## Server-Side Caching

The health endpoint (`/api/health/niledb`) now implements Redis caching to prevent excessive API calls:

- **Cache Hit/Miss Headers**: Responses include `X-Cache: HIT/MISS` and `X-Cache-TTL` headers
- **Status-based TTL**: Different cache durations based on health status
- **Automatic Invalidation**: Cache automatically expires based on TTL
- **Graceful Degradation**: Falls back to fresh checks if Redis is unavailable

### Cache Strategy
- **Healthy**: 5-minute cache (300 seconds)
- **Degraded**: 1-minute cache (60 seconds) 
- **Unhealthy**: 30-second cache (30 seconds)
- **Unknown**: 30-second cache (30 seconds)

### Client-Side Caching
The frontend implements intelligent local caching:
- **Cached Results**: Prevents duplicate requests within TTL periods
- **Same TTL Strategy**: Client cache duration matches server-side TTL
- **Immediate Response**: Cached results are returned instantly without API calls
- **Error Caching**: Failed requests are also cached to prevent rapid retries
- **Debug Logging**: Development builds show cache hits/misses for debugging

## Migration from Auth Context

If you were previously using system health through the auth context:

```tsx
// Old way (no longer available)
const { systemHealth, checkSystemHealth } = useAuth();

// New way
const { systemHealth, checkSystemHealth } = useSystemHealth();
```

## API Endpoint

The system health checks call `/api/health/niledb` endpoint. Make sure this endpoint is properly implemented in your backend.

## Customization

You can customize the health check interval and behavior by modifying the `system-health-context.tsx` file:

- Change the check interval (currently 5 minutes)
- Modify notification messages
- Add additional health check endpoints
- Customize the UI components

## Error Handling

The system health context includes comprehensive error handling:
- Network failures are caught and displayed
- API errors are parsed and shown to users
- Failed checks can be retried manually
- Status changes trigger appropriate notifications

## Troubleshooting & Debugging

### Problem Resolution Process

During development, an issue was discovered where multiple components calling `useSystemHealth()` independently were triggering excessive API calls to the health endpoint:

```
GET /api/health/niledb 200 in 141ms  ← Component 1
GET /api/health/niledb 200 in 184ms  ← Component 2  
GET /api/health/niledb 200 in 146ms  ← Component 3
GET /api/health/niledb 200 in 142ms  ← Component 4
```

### Root Cause
Multiple components were calling the health check hook independently:
- `SystemHealthIndicator.tsx` - 2 hook calls
- `use-enhanced-auth.ts` - 1 hook call

Each component triggered its own health check on mount, regardless of server-side caching.

### Solution Implemented
A **GlobalHealthManager** singleton pattern ensures only ONE health check is performed across the entire application:

```typescript
class GlobalHealthManager {
  private static instance: GlobalHealthManager;
  private isChecking = false;
  private pendingRequests: PendingRequest[] = [];
  
  public async checkHealth(): Promise<SystemHealthStatus> {
    // Queue requests if check is in progress
    if (this.isChecking) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }
    
    // Perform single health check
    return this.performHealthCheck();
  }
}
```

### Debug Features

**Browser Console Access**:
```javascript
// Check global manager stats
window.globalHealthDebug.getStats()

// Force a new health check
window.globalHealthDebug.checkHealth(true)

// Reset all counters
window.globalHealthDebug.reset()
```

**Console Logging**:
- Instance creation/destruction tracking
- API call counting and cache hit tracking
- Global manager request queuing logs
- Status change notifications

### Performance Impact

- **API Calls**: Reduced from 4+ calls to 1 call (75% reduction)
- **Response Time**: Cached results return instantly (<1ms vs 140ms+)
- **Server Load**: Dramatic reduction in health endpoint requests
- **User Experience**: Maintained notification quality with better performance