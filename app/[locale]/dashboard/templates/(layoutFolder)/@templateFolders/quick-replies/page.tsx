import Folders from "@/features/campaigns/ui/components/templates/Folders";
import { getTemplateFolders } from "@features/campaigns/actions/templates";
import { TemplateFolder } from "@/types";
import { FolderIcon } from "lucide-react";

async function TemplateFolders() {
  const result = await getTemplateFolders();

  if (!result || !result.success) {
    return <div>Error: Failed to load folders</div>;
  }

  const folders = result.data
    ? (result.data.filter(
        (folder) => folder.type === "quick-reply"
      ) as TemplateFolder[])
    : [];
  
  // Calculate total templates by summing templateCount from all folders
  const totalTemplates = folders.reduce((sum, folder) => sum + (folder.templateCount || 0), 0);
  
  if (folders.length === 0) {
    return null;
  }
  return (
    <div className="bg-gray-50 dark:bg-muted/30 p-2 px-4 border-r border-gray-200 dark:border-border w-72 space-y-5">
      <h1 className="text-md font-semibold">Folders</h1>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg">
          <FolderIcon className="w-4 h-4" />
          <span className="font-medium">All Templates</span>
          <span className="ml-auto text-xs bg-blue-100 px-2 py-1 rounded-full">
            {totalTemplates}
          </span>
        </div>
        <Folders folders={folders} showFiles={true} />
      </div>
    </div>
  );
}
export default TemplateFolders;

