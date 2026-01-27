# PenguinMails Development Continuation Prompt

## Project Context

You are working on **PenguinMails**, a modern email marketing platform built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. The backend integrates deeply with **Mautic** (for marketing automation) and **HestiaCP** (for email infrastructure/server management).

## Architecture & patterns

- **Framework**: Next.js 15 using Server Actions for all data mutations and fetching (no API routes unless absolutely necessary).
- **Styling**: Tailwind CSS with Shadcn UI components.
- **Database/State**: Direct integration with external APIs (Hestia/Mautic) via adapter layers found in `features/infrastructure/api` and `features/marketing/lib`.
- **Interactivity**: strict separation of Server Components (data fetching) and Client Components (interactive UI, forms, tooltips).

## Recently Completed Features

We have finished the **Advanced Leads & Segments Management** implementation:

1. **Individual Contact Management**:
   - Polished `ContactDetail` view showing Mautic-specific metrics like star-rated engagement points and relative "last active" timestamps.
   - Dedicated `LeadEditForm` for real-time contact metadata synchronization (names, emails, company, phone).

2. **Segment Management Flow**:
   - Dedicated `SegmentDetail` view to manage memberships directly from the dashboard.
   - Full membership lifecycle: implemented reliable contact removal and a searchable "Add Contact" dialog to assign existing contacts to segments.
   - Metadata Editing: Users can now update segment names, machine-readable aliases, and descriptions with immediate Mautic sync.

3. **Data Integrity & UX**:
   - **Background Sync**: The segment list view now asynchronously verifies contact counts to bypass Mautic's stale cache, using a subtle "pulse" animation during live sync.
   - **Fixed membership search**: Resolved a critical issue by switching contact filtering from numeric IDs to machine-readable **Aliases**, as required by the Mautic 5 API.

## Current State

- **Infrastructure**: Complete and verified (Domains, Mailboxes, Databases, System Health).
- **Campaigns**: Creation flow with sequence support and automated template generation is fully functional.
- **Leads & Segments**: Advanced management cycle is complete and synchronized with Mautic 5.

## Next Priority Tasks

The next session should focus on the **Analytics Dashboard** and finishing up **Settings**:

1. **Analytics Dashboard** (`/dashboard` root):
   - Connect dashboard widgets to real Mautic/Hestia metrics (Open rates, Click rates from webhooks, Server Health).
   - Visualize data from the `marketing_events` table in NileDB.

2. **Settings & Billing**:
   - Complete user profile and subscription management.
   - Finalize integration of BillManager data for real-time balance and invoice displays.

## Rules for Continuation

1. **Always use Server Actions** for backend logic.
2. **Verify Mautic API calls** in `features/marketing/actions` and `features/leads/actions`.
3. **Keep UI consistent** with the existing "Premium/Glassmorphic" aesthetic.
4. **Use specific search prefixes** (like `segment:alias`) for reliable Mautic filtering.
