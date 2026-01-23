import { Suspense } from "react";
import ConversationsList from "@features/inbox/ui/components/ConversationsList";
import InboxFilter from "@features/inbox/ui/components/filters/InboxFilter";
import SmartInsights from "@features/inbox/ui/components/smart-insights";
import { getFilteredConversations } from "@features/inbox/actions";
import InboxLoading from "./loading";
import { InboxProvider } from "@features/inbox/ui/context/inbox-context";
import type { Conversation } from "@features/inbox/types";

// Client wrapper to provide context for all inbox components
function InboxPageClient({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  return (
    <InboxProvider initialConversations={initialConversations}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-foreground">
        <div className="rounded-tl-2xl overflow-hidden flex flex-col dark:bg-muted/50 dark:divide-border">
          <SmartInsights />
          <InboxFilter />
        </div>
        <div className="col-span-2 dark:bg-card">
          <ConversationsList conversations={initialConversations} />
        </div>
      </div>
    </InboxProvider>
  );
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  
  // Fetch initial data on server
  const conversationsResult = await getFilteredConversations(params);
  const initialConversations =
    conversationsResult.success && conversationsResult.data
      ? conversationsResult.data
      : [];

  return (
    <Suspense fallback={<InboxLoading />}>
      <InboxPageClient
        initialConversations={initialConversations}
      />
    </Suspense>
  );
}
