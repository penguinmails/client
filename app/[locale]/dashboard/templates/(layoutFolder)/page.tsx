import TemplateItem from "@/features/campaigns/ui/components/templates/TemplateItem";
import { Input } from "@/components/ui/input/input";
import { getTemplates } from "@features/campaigns/actions/templates";

// Force dynamic rendering for authentication checks
export const dynamic = "force-dynamic";

async function Page() {
  const templates = await getTemplates();

  return (
    <div className="p-4 space-y-4 h-full">
      <div>
        <Input placeholder="Search Templates" />
      </div>
      { }
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
      { }
        {templates.map((template) => (
          <TemplateItem key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
export default Page;
