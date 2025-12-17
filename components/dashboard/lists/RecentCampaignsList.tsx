import React from "react";
import { Mail, BarChart2, MessageSquare, MousePointer } from "lucide-react";
import Link from "next/link";
import { textColors, typography } from "@/shared/lib/design-tokens";
import { cn } from "@/shared/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";

// Define the expected data structure for props
interface CampaignStat {
  id: number;
  name: string;
  total: number;
  opens: number;
  clicks: number;
  replies: number;
}

interface RecentCampaignsListProps {
  campaigns: CampaignStat[];
}

const RecentCampaignsList: React.FC<RecentCampaignsListProps> = ({
  campaigns,
}) => {
  return (
    <Card className="h-64 flex flex-col">
      <CardHeader>
        <CardTitle className={typography.cardTitle}>
          Recent Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {/* Use the campaigns prop */}
        <ul className="divide-y divide-border">
          {campaigns.map((campaign, index) => (
            <li key={index} className="py-3">
              <p className={cn("text-sm font-medium truncate mb-1", textColors.primary)}>
                <Link
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className={textColors.linkHover}
                >
                  {campaign.name}
                </Link>
              </p>
              <div className={cn("flex items-center space-x-3 text-xs", textColors.secondary)}>
                <span className="flex items-center">
                  <Mail size={12} className="mr-1" /> {campaign.total}
                </span>
                <span className="flex items-center">
                  <BarChart2 size={12} className="mr-1" /> {campaign.opens}
                </span>
                <span className="flex items-center">
                  <MousePointer size={12} className="mr-1" /> {campaign.clicks}
                </span>
                <span className="flex items-center">
                  <MessageSquare size={12} className="mr-1" />{" "}
                  {campaign.replies}
                </span>
              </div>
            </li>
          ))}
          {/* Add a message if no campaigns */}
          {campaigns.length === 0 && (
            <li className={cn("py-3 text-sm text-center", textColors.secondary)}>
              No recent campaigns found.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentCampaignsList;
