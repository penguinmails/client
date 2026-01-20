# HTTP API Routes

This document describes the HTTP API routes available in the application. These routes are located in `app/api/` and provide data for various features, primarily used by Client Components via `fetch`.

## Analytics API (`/api/analytics`)

### Dashboard
**GET** `/api/analytics/dashboard`
- **Description**: Returns mock statistics and chart data for the main analytics dashboard.
- **Response**: JSON object containing `stats` (key-value metrics) and `chartData` (array of time-series data).

### Mailboxes
**GET** `/api/analytics/mailboxes`
- **Description**: Returns a list of mailboxes with their warmup status and health scores.
- **Response**: JSON array of `MailboxWarmupData` objects.

**GET** `/api/analytics/mailboxes/[id]`
- **Description**: Returns detailed analytics for a specific mailbox.
- **Parameters**: `id` - Mailbox ID
- **Response**: JSON object containing extended mailbox analytics.

**POST** `/api/analytics/mailboxes/analytics`
- **Description**: Batch fetch analytics for multiple mailboxes.
- **Body**: `{ mailboxIds: string[] }`
- **Response**: JSON object where keys are mailbox IDs and values are analytics objects.

### Account Metrics
**GET** `/api/analytics/account-metrics`
- **Description**: Returns aggregated metrics for the entire account (sent, delivered, opened, etc.).
- **Response**: JSON object conforming to `AccountMetrics` type.

### Warmup
**GET** `/api/analytics/warmup`
- **Description**: Returns mock warmup data for charts.
- **Response**: JSON array of `WarmupChartData` objects.

## Infrastructure API

### Mailboxes
**GET** `/api/mailboxes`
- **Description**: Returns mock mailbox data for the Mailboxes infrastructure page can optionally include analytics.
- **Query Params**: `analytics=true` (optional)
- **Response**: JSON object `{ mailboxes: [...], analytics: [...] }`.

### Warmup
**GET** `/api/warmup`
- **Description**: Returns mock warmup data for the Warmup infrastructure page.
- **Response**: JSON object containing warmup statistics and mailbox statuses.

## Campaigns API (`/api/campaigns`)

**GET** `/api/campaigns`
- **Description**: Returns a list of campaigns.
- **Response**: JSON array of campaign objects.
