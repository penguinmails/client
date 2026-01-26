# PenguinMails Development Continuation Prompt

## Project Context

You are working on **PenguinMails**, a modern email marketing platform built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. The backend integrates deeply with **Mautic** (for marketing automation) and **HestiaCP** (for email infrastructure/server management).

## Architecture & patterns

- **Framework**: Next.js 15 using Server Actions for all data mutations and fetching (no API routes unless absolutely necessary).
- **Styling**: Tailwind CSS with Shadcn UI components.
- **Database/State**: Direct integration with external APIs (Hestia/Mautic) via adapter layers found in `features/infrastructure/api` and `features/marketing/lib`.
- **Interactivity**: strict separation of Server Components (data fetching) and Client Components (interactive UI, forms, tooltips).

## Recently Completed Features

We have just finished a major effort on the **Leads and Contacts Management**:

1. **Leads Migration to Mautic**:
   - Replaced all NileDB queries with direct Mautic API calls (`listContactsAction`, `listSegmentsAction`).
   - Dashboard stats (Total Contacts, Total Segments) and lead lists are now real-time from Mautic.
   - Refactored `ContactsTab` and `ListsTab` to use async server actions instead of mock data.

2. **CSV Upload for Leads**:
   - Implemented full server-side CSV import flow (`importCSVContactsAction`).
   - Users can upload files, map columns to Mautic fields, and create new segments automatically.
   - Added a summary screen with success/failure counts.

3. **UI Data Consistency**:
   - Synced dashboard tab counts with Mautic statistics.

## Current State

- The **Infrastructure** and **Leads (Core)** sections are effectively complete and verified.
- The **Campaigns** section (Mautic integration) is complete.
- CSV Upload is functional but needs more robust field mapping (e.g., custom fields).

## Next Priority Tasks

The next session should focus on polishing the **Leads & Segments** integration and starting the **Analytics** dashboard:

1. **Leads & Segments Polish**:
   - **Data Completeness**: Some columns in the segments/lists view are currently empty or using placeholders; need to map missing Mautic fields.
   - **"View" Actions**: Implement the "View" button logic for both the **Segments/Lists** and **Contacts** tabs (currently non-functional).
   - **Contact Details**: Create a dedicated contact detail view page.

2. **Analytics Dashboard** (`/dashboard` root):
   - Connect dashboard widgets to real Mautic/Hestia metrics (Open rates, Click rates, Server Health).

3. **Settings & Billing**:
   - User profile and subscription management.

## Rules for Continuation

1. **Always use Server Actions** for backend logic.
2. **Verify Mautic API calls** in `features/marketing/actions` and `features/leads/actions`.
3. **Keep UI consistent** with the existing "Premium/Glassmorphic" aesthetic.
4. **Check `task.md`** in the artifacts directory for history.
