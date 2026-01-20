import ConversationSkeleton from "@features/inbox/ui/components/conversation/conversation-skeleton";
import { ConversationProvider } from "@features/inbox/ui/context/conversation-context";
import { Suspense } from "react";
import ClientConversationWrapper from "./wrapper";

function page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ConversationSkeleton />}>
      <ConversationProvider>
        <ClientConversationWrapper params={params} />
      </ConversationProvider>
    </Suspense>
  );
}
export default page;
