# PenguinMails Development Continuation Prompt

## Project Context
You are working on **PenguinMails**, a modern email marketing platform built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. The backend integrates deeply with **Mautic** (for marketing automation) and **HestiaCP** (for email infrastructure/server management).

## Architecture & patterns
- **Framework**: Next.js 15 using Server Actions for all data mutations and fetching (no API routes unless absolutely necessary).
- **Styling**: Tailwind CSS with Shadcn UI components.
- **Database/State**: Direct integration with external APIs (Hestia/Mautic) via adapter layers found in `features/infrastructure/api` and `features/marketing/lib`.
- **Interactivity**: strict separation of Server Components (data fetching) and Client Components (interactive UI, forms, tooltips).

## Recently Completed Features
We have just finished a major sprint on the **Infrastructure Dashboard**:

1.  **Domain Management** (`/dashboard/domains`):
    *   Unified list of Web-hosted and DNS-managed domains.
    *   Dynamic domain detail page (`/dashboard/domains/[domain]`).
    *   Real-time fetching of DNS records (SPF, DKIM, DMARC, MX) from HestiaCP.
    *   Validation logic for security records.

2.  **Mailboxes Dashboard** (`/dashboard/mailboxes`):
    *   Aggregated view of ALL email accounts across domains.
    *   Visual disk usage metrics (vs Quota).
    *   Status badges (Active/Warming/Suspended).
    *   Refactored into `MailboxesTable` client component to prevent SSR event handler errors.

3.  **UI Polish**:
    *   Added "Click-to-Copy" functionality for all technical values (DNS records, Email addresses).
    *   Added instructional tooltips explaining record types (e.g., "TXT (SPF)").

## Current State
- The **Infrastructure** section is effectively complete and verified.
- The **Campaigns** section (Mautic integration) is complete, including "Draft vs Launch" logic.
- The codebase is clean, linted, and type-checked (0 errors).

## Next Priority Tasks
The next session should focus on the remaining dashboard pillars:

1.  **Analytics Dashboard** (`/dashboard` root):
    *   The widgets exist but are likely using mock data.
    *   Need to connect them to Mautic stats (Open rates, Click rates) and Hestia stats (Volume/Reputation).
2.  **Settings / Profile**:
    *   User profile management.
    *   API Key management (if applicable).
3.  **Billing**:
    *   Subscription management flow (if applicable).

## Rules for Continuation
1.  **Always use Server Actions** for backend logic.
2.  **Verify Hestia/Mautic API calls** before writing new ones (check `features/*/api` first).
3.  **Keep UI consistent** with the existing "Premium/Glassmorphic" aesthetic.
4.  **Check `task.md`** in the artifacts directory for granular tracking if available.
