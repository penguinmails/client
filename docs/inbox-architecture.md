# Inbox Page Architecture

## Overview

This document describes the refactored architecture for the inbox page, designed to support backend integration with low/medium latency data while providing a smooth user experience through server-side rendering and client-side interactions.

## Architecture Components

### 1. Server-Side Components

#### Page Component (`app/[locale]/dashboard/inbox/page.tsx`)
- **Role**: Main entry point that coordinates data fetching and rendering
- **Key Features**:
  - Server-side data fetching with `getFilteredConversations`
  - Suspense boundary for loading state
  - Error boundary for error handling
  - Client-side context provider wrapper

#### Loading Component (`app/[locale]/dashboard/inbox/loading.tsx`)
- **Role**: Skeleton screen for initial loading state
- **Features**:
  - Comprehensive skeleton for all inbox sections (filters, smart insights, conversations)
  - Responsive design matching the actual UI
  - Smooth loading experience

#### Error Component (`app/[locale]/dashboard/inbox/error.tsx`)
- **Role**: Error boundary for handling failed data fetching
- **Features**:
  - Clear error message with details
  - Retry functionality
  - Professional UI with gradient background
  - Placeholder state for sidebar components

### 2. Client-Side Components

#### Context Provider (`features/inbox/ui/context/inbox-context.tsx`)
- **Role**: Central state management for the inbox
- **Key Features**:
  - Filter state management via reducer
  - Conversations state with loading/error tracking
  - Refresh functionality with API integration
  - Type-safe context API with TypeScript interfaces

#### Conversations List (`features/inbox/ui/components/ConversationsList.tsx`)
- **Role**: Visual component for displaying conversations
- **Features**:
  - Pure UI component separated from business logic
  - Loading and error state rendering
  - Optimistic updates for starring and marking as read
  - Responsive design with hover effects

#### Inbox Filter (`features/inbox/ui/components/filters/InboxFilter.tsx`)
- **Role**: Filtering UI for conversations
- **Features**:
  - Multiple filter types: status, campaigns, mailboxes, tags, time
  - Multi-select functionality with badge display
  - API integration for dynamic filter options
  - URL sync with search parameters

#### Smart Insights (`features/inbox/ui/components/smart-insights.tsx`)
- **Role**: Displaying analytics insights
- **Features**:
  - Four-column grid of key metrics
  - Gradient background design
  - Context-based data from analytics system

### 3. Backend Integration

#### API Endpoint (`app/api/inbox/conversations/route.ts`)
- **Role**: RESTful API endpoint for fetching conversations
- **Features**:
  - GET request handler with search parameter parsing
  - Integration with `getFilteredConversations` server action
  - Error handling and response formatting
  - Count and data included in response

#### Server Action (`features/inbox/actions/index.ts`)
- **Role**: Data fetching interface for server-side code
- **Features**:
  - Currently using mock data (to be replaced with real backend calls)
  - Error handling and logging
  - Support for search parameters
  - Standardized response format

## Data Flow

### Initial Load
1. Server: `page.tsx` fetches initial conversations
2. Server: `getFilteredConversations` returns mock data
3. Server: Renders `InboxPageClient` with context provider
4. Client: Hydrates components with initial data
5. Client: `InboxFilter` fetches dynamic filter options (campaigns, mailboxes)

### Filtering
1. User interacts with a filter in `InboxFilter`
2. Context dispatch updates filter state
3. URL search parameters are updated
4. `refreshConversations` is called
5. API endpoint is invoked with new filters
6. Conversations list updates with new data

## Performance Optimizations

### Server-Side Rendering
- Initial data fetched and rendered on server
- Suspense boundaries show loading state
- Error boundaries handle failures

### Client-Side Caching
- Conversations stored in context state
- Loading and error states tracked
- Optimistic updates for faster UI feedback

### Lazy Loading
- Filters fetch dynamic options in useEffect
- Loading states show skeletons
- Error handling for failed requests

## Future Improvements

### Backend Integration
- Replace `mockConversations` with real API call
- Implement pagination for large datasets
- Add caching layer (Redis, Memcached)

### Performance
- Add infinite scroll for conversations
- Implement filter caching
- Optimize API response payloads

### Features
- Add search functionality
- Implement sorting options
- Add conversation grouping (by campaign, tag, etc.)

### Testing
- Add integration tests for API endpoint
- Test filter interactions
- Implement performance testing

## File Structure

```
app/
├── [locale]/
│   └── dashboard/
│       └── inbox/
│           ├── page.tsx               # Main entry point
│           ├── loading.tsx            # Loading skeleton
│           └── error.tsx              # Error boundary
└── api/
    └── inbox/
        └── conversations/
            └── route.ts               # API endpoint

features/
└── inbox/
    ├── actions/
    │   └── index.ts                  # Server actions
    ├── types/
    │   └── index.ts                  # Type definitions
    └── ui/
        ├── components/
        │   ├── ConversationsList.tsx  # Conversations display
        │   ├── smart-insights.tsx     # Analytics cards
        │   └── filters/
        │       └── InboxFilter.tsx    # Filter UI
        └── context/
            └── inbox-context.tsx      # State management
```

## Technology Stack

- **Next.js 15** - Framework for SSR and client-side rendering
- **React 19** - UI library with hooks and context
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Getting Started

### Development
```bash
npm run dev
```

### Type Checking
```bash
npm run typecheck
```

### Build
```bash
npm run build
```

This architecture provides a solid foundation for the inbox page, ready to integrate with a real backend service while maintaining a high-quality user experience.
