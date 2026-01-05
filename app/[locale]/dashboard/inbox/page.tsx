import ConversationsList from "@features/inbox/ui/components/ConversationsList";
import InboxFilter from "@features/inbox/ui/components/filters/InboxFilter";
import SmartInsights from "@features/inbox/ui/components/smart-insights";
import { getFilteredConversations } from "@features/inbox/actions";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const conversationsResult = await getFilteredConversations(params);

  // Handle ActionResult properly
  const conversations =
    conversationsResult.success && conversationsResult.data
      ? conversationsResult.data
      : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-foreground">
      <div className="rounded-tl-2xl overflow-hidden flex flex-col dark:bg-muted/50 dark:divide-border">
        <SmartInsights />
        <InboxFilter />
      </div>
      <div className="col-span-2 dark:bg-card">
        <ConversationsList conversations={conversations} />
      </div>
    </div>
  );
}
