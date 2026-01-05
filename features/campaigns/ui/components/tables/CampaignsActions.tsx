"use client";
import { getMockCampaigns } from "@/shared/mocks/providers";
import { Copy, Edit, Eye, Pause, Play } from "lucide-react";
import Link from "next/link";
import AlertDialogDelete from "@/components/ui/custom/AlertDialogDelete";
import { Button } from "@/components/ui/button";
import { developmentLogger } from "@/lib/logger";

export enum CampaignActionsEnum {
  VIEW = "view",
  EDIT = "edit",
  DELETE = "delete",
  PAUSE = "pause",
  RESUME = "resume",
  COPY = "copy",
}

function CampaignsActions({
  campaignId,
  actions = ["VIEW", "EDIT", "PAUSE", "COPY", "DELETE"],
}: {
  campaignId: string;
  actions?: (keyof typeof CampaignActionsEnum)[];
}) {
  const campaignsData = getMockCampaigns();
  const campaign = campaignsData.find((c) => c.id === campaignId);
  if (!campaign) return null;
  const actionComponents = {
    VIEW: <ViewAction campaignId={String(campaign.id)} />,
    EDIT: <EditAction campaignId={String(campaign.id)} />,
    DELETE: <DeleteAction campaignId={String(campaign.id)} />,
    PAUSE: <PauseAction campaignId={String(campaign.id)} />,
    RESUME: <ResumeAction campaignId={String(campaign.id)} />,
    COPY: <CopyAction campaignId={String(campaign.id)} />,
  };
  return (
    <div className="flex items-center space-x-3 space-x-reverse">
      {actions.map((action, index) => (
        <span key={`${action}-${index}`}>{actionComponents[action]}</span>
      ))}
    </div>
  );
}

function ViewAction({ campaignId }: { campaignId: string }) {
  return (
    <Button variant="ghost" size="icon" title="View Campaign" asChild>
      <Link
        href={`/dashboard/campaigns/${campaignId}`}
        className="text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent rounded-lg p-2 transition-colors inline-flex items-center justify-center"
      >
        <Eye className="size-4" />
      </Link>
    </Button>
  );
}
function EditAction({ campaignId }: { campaignId: string }) {
  return (
    <Button variant="ghost" size="icon" title="Edit Campaign" asChild>
      <Link
        href={`/dashboard/campaigns/${campaignId}/edit`}
        className="text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent rounded-lg p-2 transition-colors inline-flex items-center justify-center"
      >
        <Edit className="size-4" />
      </Link>
    </Button>
  );
}
function DeleteAction({ campaignId }: { campaignId: string }) {
  return (
    <AlertDialogDelete
      title="Delete Campaign"
      description="Are you sure you want to delete this campaign? This action cannot be undone."
      onDelete={async () => {
        developmentLogger.debug(`Deleting campaign with ID: ${campaignId}`);
      }}
    />
  );
}
function PauseAction({ campaignId: _campaignId }: { campaignId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-2 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/20 transition-colors"
      title="Pause Campaign"
    >
      <Pause className="size-4" />
    </Button>
  );
}
function ResumeAction({ campaignId: _campaignId }: { campaignId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/20 transition-colors"
      title="Resume Campaign"
    >
      <Play className="size-4" />
    </Button>
  );
}
function CopyAction({ campaignId: _campaignId }: { campaignId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
      title="Copy Campaign"
    >
      <Copy className="size-4" />
    </Button>
  );
}
export default CampaignsActions;
