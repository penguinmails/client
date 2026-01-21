# System Health Components

This document describes the system health monitoring components and retry functionality that provide robust health checking and user feedback throughout the application.

## Overview

The system health functionality provides adaptive health checking with intelligent retry logic, user notifications, and manual intervention capabilities. It consists of several interconnected components that work together to monitor system status and handle connection issues gracefully.

## Components

### SystemHealthIndicator

A visual indicator component that displays the current system health status with interactive controls.

**Features:**

- Real-time health status display (healthy, degraded, unhealthy, unknown)
- Manual health check capability
- Retry status and attempt tracking
- Manual reset functionality when retry limits are reached

**Usage:**

```tsx
import { SystemHealthIndicator } from "@/components/SystemHealthIndicator";

<SystemHealthIndicator showDetails={true} />;
```

### ManualRetryModal

A modal component that appears when the retry limit is reached, providing users with information and manual retry options.

**Features:**

- Explains connection issues to users
- Shows retry protection status
- Provides manual retry functionality
- Displays countdown to next automatic retry

### SystemHealthProvider

A React context provider that manages global health state and checking logic.

**Features:**

- Centralized health state management
- Adaptive checking intervals based on health status
- Automatic retry logic with exponential backoff
- Client-side and server-side caching integration

## Health Monitoring Strategy

### Adaptive Intervals

The system uses different check frequencies based on current health status:

- **Healthy**: Every 5 minutes (reduces API load)
- **Degraded**: Every 1 minute (closer monitoring)
- **Unhealthy/Unknown**: Every 30 seconds (rapid detection of recovery)

### Caching Strategy

**Server-side Caching (Redis):**

- Healthy: 5-minute cache (300 seconds)
- Degraded: 1-minute cache (60 seconds)
- Unhealthy: 30-second cache (30 seconds)
- Unknown: 30-second cache (30 seconds)

**Client-side Caching:**

- Prevents duplicate requests within TTL periods
- Matches server-side TTL strategy
- Immediate response for cached results
- Error caching to prevent rapid retries

### Retry Logic

**Exponential Backoff:**

- First retry: 1 second delay
- Second retry: 2 seconds delay
- Third retry: 4 seconds delay
- Fourth retry: 8 seconds delay
- Fifth retry: 16 seconds delay
- Maximum backoff: 30 seconds

**Retry Limits:**

- Maximum of 5 retry attempts before stopping automatic checks
- Manual reset option when limit is reached
- Retry counter resets after successful checks
- Global retry management prevents multiple concurrent checks

## Implementation Details

### GlobalHealthManager

A singleton class that manages health checking across the entire application:

```typescript
class GlobalHealthManager {
  private retryAttempts = 0;
  private maxRetries = 5;
  private backoffMultiplier = 2;
  private baseBackoffTime = 1000; // 1 second

  private getBackoffDelay(): number {
    if (this.retryAttempts === 0) return 0;
    return Math.min(
      this.baseBackoffTime *
        Math.pow(this.backoffMultiplier, this.retryAttempts - 1),
      30000, // Max 30 seconds backoff
    );
  }
}
```

### Health Check Flow

1. **Health Check Initiated**
   - System attempts to check health status
   - Retry counter increments if check fails

2. **Check Fails**
   - If attempts < maxRetries: schedule retry with backoff
   - If attempts >= maxRetries: stop automatic retries
   - Show retry limit reached message

3. **Backoff Timing**
   - Exponential delay calculation
   - Maximum 30 seconds between retries
   - Reset retry count after successful checks

4. **Manual Intervention**
   - User can bypass retry limit with manual reset
   - Modal provides explanation and options
   - Manual retry forces new health check

5. **Successful Check**
   - Reset retry counter to 0
   - Return to normal health monitoring
   - Clear retry limit status

## Usage Examples

### Basic Health Monitoring

```tsx
import { useSystemHealth } from "@/context/system-health-context";

function MyComponent() {
  const { systemHealth, checkSystemHealth, isChecking } = useSystemHealth();

  return (
    <div>
      <p>System Status: {systemHealth.status}</p>
      <p>Last Check: {systemHealth.lastCheck?.toLocaleString()}</p>
      {systemHealth.details && <p>Details: {systemHealth.details}</p>}
      <button onClick={checkSystemHealth} disabled={isChecking}>
        {isChecking ? "Checking..." : "Check Health"}
      </button>
    </div>
  );
}
```

### Simple Status Hook

```tsx
import { useSystemHealthStatus } from "@/components/SystemHealthIndicator";

function HealthStatusBadge() {
  const { isHealthy, status } = useSystemHealthStatus();

  return (
    <Badge variant={isHealthy ? "default" : "destructive"}>
      System {status}
    </Badge>
  );
}
```

### Dashboard Integration

```tsx
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

## Configuration

### Health Check Settings

The retry behavior can be configured in the GlobalHealthManager:

```typescript
private retryAttempts = 0;
private maxRetries = 5;                    // Maximum retry attempts
private backoffMultiplier = 2;             // Exponential factor
private baseBackoffTime = 1000;            // Base delay (1 second)
```

### API Endpoint

The system health checks call `/api/health/niledb` endpoint with the following features:

- Redis caching with status-based TTL
- Cache hit/miss headers (`X-Cache`, `X-Cache-TTL`)
- Graceful degradation if Redis is unavailable
- Automatic cache invalidation

## Error Handling

### Network Failures

- All network failures are caught and logged
- Retry attempts are tracked per session
- Failed requests don't block the UI
- Users can continue using the application during server issues

### UI States

**Normal Operation:**

- Shows current health status with timestamp
- Manual check button available
- Green/yellow/red status indicators

**Retry In Progress:**

- Shows attempt count (e.g., "3/5 attempts")
- Yellow warning indicator
- Manual check button disabled during retry

**Retry Limit Reached:**

- Red "Retry limit reached" indicator
- Warning about connection issues
- Manual reset button with alert icon
- Countdown to next automatic retry

## Debugging

### Development Features

In development mode, debug features are available via browser console:

```javascript
// Check global manager stats
window.globalHealthDebug.getStats();

// Force a health check
window.globalHealthDebug.checkHealth();

// Reset retry state
window.globalHealthDebug.manualReset();

// Get detailed retry information
window.globalHealthDebug.getRetryInfo();
```

### Console Logging

Development builds include detailed logging:

- Instance creation/destruction tracking
- API call counting and cache hit tracking
- Global manager request queuing logs
- Status change notifications

## Migration Notes

### From Auth Context

If you were previously using system health through the auth context:

```tsx
// Old way (no longer available)
const { systemHealth, checkSystemHealth } = useAuth();

// New way
const { systemHealth, checkSystemHealth } = useSystemHealth();
```

### Integration

The SystemHealthProvider is automatically included in the app through the main Providers component:

```tsx
// components/providers.tsx
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SystemHealthProvider>
        {" "}
        {/* ← Automatically included */}
        <ThemeProvider>
          <ClientPreferencesProvider>{children}</ClientPreferencesProvider>
        </ThemeProvider>
      </SystemHealthProvider>
    </QueryClientProvider>
  );
}
```

## Benefits

1. **Prevents Browser Issues**: Stops infinite retry loops that can freeze the browser
2. **Reduces Server Load**: Exponential backoff reduces request frequency
3. **User Control**: Manual reset option gives users control over retry behavior
4. **Clear Feedback**: Visual indicators show exactly what's happening
5. **Graceful Degradation**: System continues to work even with server issues
6. **Performance Optimization**: Multi-layer caching prevents excessive API calls
7. **Session Management**: Retry limits reset after periods of stability

## Related Documentation

- **[System Health Context](../../context/system-health-context.tsx)** - Context provider implementation
- **[Health API Endpoint](../../app/api/health/niledb/route.ts)** - Server-side health checking
- **[Error Handling](../guides/actions-api.md#error-handling)** - Standardized error handling patterns
- **[Performance Monitoring](../performance/monitoring.md)** - Application performance guidelines
