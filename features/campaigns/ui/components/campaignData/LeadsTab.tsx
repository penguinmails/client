import { Card, CardContent } from "@/components/ui/card";
import { getCampaignLeads } from "@features/campaigns/actions";
import { CampaignLead } from "@features/campaigns/types";
import LeadsFilter from "./LeadsFilter";

const getStatusColor = (status: string) => {
  switch (status) {
    case "replied":
      return "bg-green-100 text-green-800";
    case "opened":
      return "bg-blue-100 text-blue-800";
    case "sent":
      return "bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground";
    case "bounced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground";
  }
};

async function LeadsTab({ campaignId }: { campaignId: string }) {
  const campaignLeadsResult = await getCampaignLeads(campaignId);
  const campaignLeads = campaignLeadsResult.success
    ? campaignLeadsResult.data || []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">
          Campaign Leads
        </h3>
      </div>
      <div>
        <LeadsFilter />
      </div>
      <Card className="p-0">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaignLeads.map((lead: CampaignLead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-foreground">
                        {lead.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-muted-foreground">
                        {lead.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-muted-foreground">
                        {lead.company}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        lead.status || 'not-used'
                      )}`}
                    >
                      {lead.status || 'not-used'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-foreground">
                    Step {lead.currentStep}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-muted-foreground">
                    {lead.lastActivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
export default LeadsTab;
