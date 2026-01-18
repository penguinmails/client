import WarmupContent from "./warmup-content";

export const dynamic = "force-dynamic";

/**
 * Warmup Page - Server Component
 *
 * Delegates to WarmupContent client component for client-side logic.
 */
export default function WarmupPage() {
  return <WarmupContent />;
}
