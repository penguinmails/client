# Health Monitor Retry Implementation

This document describes the implementation of retry logic and manual confirmation for the system health monitor to prevent infinite retry loops when the server is down.

## Problem Solved

Previously, when the server was down, the health monitor would keep trying indefinitely, which could:
- Flood the client side with retry requests
- Cause browser performance issues
- Create unnecessary network traffic
- Make the UI unresponsive

## Solution Overview

The implementation includes:

### 1. Retry Limit (5 attempts)
- Maximum of 5 retry attempts before stopping automatic checks
- Prevents infinite retry loops
- Uses exponential backoff to reduce server load

### 2. Exponential Backoff
- First retry: 1 second delay
- Second retry: 2 seconds delay  
- Third retry: 4 seconds delay
- Fourth retry: 8 seconds delay
- Fifth retry: 16 seconds delay
- Maximum backoff: 30 seconds

### 3. Manual Reset Option
- When retry limit is reached, users can manually reset
- Bypasses the retry limit to try again
- Provides user control over the retry process

### 4. Visual Feedback
- Retry status indicator shows current attempt count
- Warning when approaching retry limit
- Error state when limit is reached
- Time until next retry display

## Implementation Details

### Core Components

#### 1. GlobalHealthManager (shared/hooks/use-system-health.ts)
- Manages retry state globally
- Implements exponential backoff logic
- Tracks retry attempts and limits
- Provides manual reset functionality

```typescript
class GlobalHealthManager {
  private retryAttempts = 0;
  private maxRetries = 5;
  private backoffMultiplier = 2;
  private baseBackoffTime = 1000; // 1 second

  private getBackoffDelay(): number {
    if (this.retryAttempts === 0) return 0;
    return Math.min(
      this.baseBackoffTime * Math.pow(this.backoffMultiplier, this.retryAttempts - 1),
      30000 // Max 30 seconds backoff
    );
  }
}
```

#### 2. ManualRetryModal (components/common/ManualRetryModal.tsx)
- Modal that appears when retry limit is reached
- Explains the connection issue
- Provides manual retry option
- Shows time until next automatic retry

#### 3. Enhanced SystemHealthIndicator (components/common/SystemHealthIndicator.tsx)
- Shows retry status in the health indicator
- Displays attempt count and retry limit
- Provides manual reset button when limit reached
- Shows time until next retry

### Retry Logic Flow

1. **Health Check Initiated**
   - System attempts to check health status
   - Retry counter increments

2. **Check Fails**
   - If attempts < maxRetries: schedule retry with backoff
   - If attempts >= maxRetries: stop automatic retries
   - Show retry limit reached message

3. **Backoff Timing**
   - Exponential delay: 1s, 2s, 4s, 8s, 16s
   - Maximum 30 seconds between retries
   - Reset retry count after 5 minutes of no successful checks

4. **Manual Intervention**
   - User can click manual reset to bypass limit
   - Modal provides explanation and options
   - Manual retry forces a new health check

5. **Successful Check**
   - Reset retry counter to 0
   - Return to normal health monitoring
   - Clear retry limit status

## User Interface

### Health Indicator States

#### Normal Operation
- Shows current health status (healthy/degraded/unhealthy)
- Last check timestamp
- Manual check button

#### Retry In Progress  
- Shows attempt count (e.g., "3/5 attempts")
- Yellow warning indicator
- Manual check button disabled

#### Retry Limit Reached
- Red "Retry limit reached" indicator
- Warning about connection issues
- Manual reset button (red alert icon)
- Time until next automatic retry

### Manual Retry Modal

When retry limit is reached, a modal appears with:

- **Status Information**: Explains server connection failure
- **Retry Protection**: Shows automatic retry protection status
- **Time Information**: Next retry availability countdown
- **Action Buttons**: Close or Manual Retry options
- **Help Text**: Explanation of the retry protection system

## Configuration

The retry behavior can be configured in the GlobalHealthManager:

```typescript
private retryAttempts = 0;
private maxRetries = 5;                    // Maximum retry attempts
private backoffMultiplier = 2;             // Exponential factor
private baseBackoffTime = 1000;            // Base delay (1 second)
```

## Benefits

1. **Prevents Browser Issues**: Stops infinite retry loops that can freeze the browser
2. **Reduces Server Load**: Exponential backoff reduces request frequency
3. **User Control**: Manual reset option gives users control
4. **Clear Feedback**: Visual indicators show exactly what's happening
5. **Graceful Degradation**: System continues to work even with server issues
6. **Session Management**: Retry limits reset after periods of stability

## Error Handling

- Network failures are caught and logged
- Retry attempts are tracked per session
- Failed requests don't block the UI
- Users can continue using the application while server is down

## Debug Features

In development mode, debug features are available via:
- `window.globalHealthDebug.getStats()` - Get current retry statistics
- `window.globalHealthDebug.checkHealth()` - Force a health check
- `window.globalHealthDebug.manualReset()` - Reset retry state
- `window.globalHealthDebug.getRetryInfo()` - Get detailed retry information

This implementation ensures that the health monitor is robust, user-friendly, and doesn't cause browser performance issues when the server is unavailable.