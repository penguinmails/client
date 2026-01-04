import QuickReplyItem from "@/features/campaigns/ui/components/templates/quick-replies/QuickReplyItem";
import { Input } from "@/components/ui/input/input";
import { listQuickReplies } from "@features/campaigns/actions";
import { Template } from "@/types";

// Force dynamic rendering since this page uses authentication
export const dynamic = "force-dynamic";

async function page() {
  const actionResult = await listQuickReplies();
  const quickReplies = actionResult && actionResult.success ? actionResult.data || [] : [];

  return (
    <div className="p-4 space-y-4">
      <div>
        <Input placeholder="Search Templates" />
      </div>
      { }
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
      { }
        {quickReplies.map((template: Template) => (
          <QuickReplyItem key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
export default page;
