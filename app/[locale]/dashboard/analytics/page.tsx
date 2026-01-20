import AnalyticsContent from "./analytics-content";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

/**
 * Analytics Page - Server Component
 * Delegates to AnalyticsContent
 */
export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
