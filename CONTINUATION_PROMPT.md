# PenguinMails Development Continuation Prompt

## Project Context

You are working on **PenguinMails**, a modern email marketing platform built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. The backend integrates deeply with **Mautic** (for marketing automation) and **HestiaCP** (for email infrastructure/server management).

## Architecture & patterns

- **Framework**: Next.js 15 App Router.
- **Data Pattern**: Hybrid approach. **Server Actions** for all data mutations. **Standard GET API Routes** for heavy read-only lists requiring browser/CDN caching and Redis integration.
- **Styling**: Tailwind CSS 4 with Shadcn UI components.
- **Database/State**: Redis-backed Mautic/Hestia adapters. NileDB for structured application state and marketing events.
- **Interactivity**: strict separation of Server Components (data fetching) and Client Components (interactive UI).

## Recently Completed Features

We have finished the **Advanced Leads & Segments Management** implementation and stabilized the API performance:

1. **Individual Contact Management**:
   - Polished `ContactDetail` view showing Mautic-specific metrics like star-rated engagement points and relative "last active" timestamps.
   - Dedicated `LeadEditForm` for real-time contact metadata synchronization (names, emails, company, phone).

2. **Segment Management Flow**:
   - Dedicated `SegmentDetail` view to manage memberships directly from the dashboard.
   - Full membership lifecycle: implemented reliable contact removal and a searchable "Add Contact" dialog to assign existing contacts to segments.
   - Metadata Editing: Users can now update segment names, machine-readable aliases, and descriptions with immediate Mautic sync.

3. **Performance Overhaul**:
   - **GET-Based Fetching**: Migrated Leads and Segments views from POST-based Server Actions to standard GET API routes (`/api/leads`, `/api/segments`). This enables browser caching and significantly smoother navigation.
   - **Redis Caching**: Implemented a server-side caching layer for expensive Mautic operations (Dashboard stats, list results). Page load times reduced from ~10s to <1s.
   - **Batch Count Optimization**: Optimized the segments list by fetching live contact counts in parallel on the server and caching them individually, eliminating "per-row" background sync loops and POST flooding.
   - **Reliability**: Fixed 429 errors by adding exponential backoff and `Retry-After` support to the core Mautic client.

4. **Analytics & Billing Integration**:
   - **Real-time Dashboard**: KPI cards for Open Rate, Click Rate, and Reply Rate are now powered by live Mautic stats and Redis-cached for sub-second responses.
   - **Infrastructure Monitoring**: Server Health widget provides a granular status breakdown of essential services (SMTP, Panel, Automation).
   - **Real BillManager Data**: Billing settings now show live account balances, service count (VPS/Domains), and automated invoice listings from BillManager API.

5. **Interface Normalization**:
   - Successfully rebranded the UI to vendor-neutral terminology (e.g., "Hosting Panel" instead of HestiaCP, "Marketing Platform" instead of Mautic) to prepare for white-labeling.

## Current State

- **Infrastructure**: Complete and verified (Domains, Mailboxes, Databases, System Health).
- **Campaigns**: Creation flow with sequence support and automated template generation is fully functional.
- **Leads & Segments**: Advanced management cycle is complete, stable, and synchronized with Mautic 5.

## Next Priority Tasks

The next session should focus on the **Analytics Dashboard**, finishing up **Settings**, and **Optimizing Data Fetching**:

1. **Analytics Dashboard** (`/dashboard` root):
   - Connect dashboard widgets to real Mautic/Hestia metrics (Open rates, Click rates from webhooks, Server Health).
   - Visualize data from the `marketing_events` table in NileDB.

2. **Settings & Billing**:
   - Complete user profile and subscription management.
   - Finalize integration of BillManager data for real-time balance and invoice displays.

3. **Data Fetching Optimization**:
   - **Switch to GET/Fetch**: Transition Leads/Segments list fetching from POST-based Server Actions to standard GET fetches where possible to leverage browser and CDN caching.
   - **Redis Caching**: Utilize the available Redis instance for shared server-side caching (5-minute windows are acceptable for leads).
   - **Cache Control**: Implement proper invalidation logic and frontend cache headers (e.g., leveraging 304 Not Modified) for maximum performance.

## Rules for Continuation

1. **Always use Server Actions** for mutations, but consider **GET-based Fetch** for heavy read operations requiring cache control.
2. **Verify Mautic API calls** in `features/marketing/actions` and `features/leads/actions`.
3. **Use specific search prefixes** (like `segment:alias`) for reliable Mautic filtering.
4. **Be defensive with background requests**: Use unmount checks and staggered delays for any automated data sync to prevent 429 errors.
5. **Leverage Redis**: For expensive Mautic operations, implement Redis-based caching with explicit invalidation on data changes.
