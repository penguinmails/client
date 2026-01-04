"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddCampaignContext } from "@features/campaigns/ui/context/add-campaign-context";
import { CampaignFormValues } from "@/types";
import { Mail, Info } from "lucide-react";

// Mailbox Interface
interface Mailbox {
  id: string;
  email: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'error' | 'warming';
  dailyLimit: number;
  currentSent: number;
  warmupProgress: number;
  healthScore: number;
  lastActivity: Date;
  createdAt: Date;
}

function MailboxAssignmentStep() {
  const { form, editingMode, campaign } = useAddCampaignContext();

  const { setValue, watch } = form;
  const selectedMailboxes = watch("selectedMailboxes") || [];

  // Mock data for mailboxes
  const mailboxes: Mailbox[] = [
    {
      id: '1',
      email: 'john@company.com',
      name: 'John Smith',
      domain: 'company.com',
      status: 'active' as const,
      dailyLimit: 500,
      currentSent: 150,
      warmupProgress: 100,
      healthScore: 95,
      lastActivity: new Date(),
      createdAt: new Date()
    },
    {
      id: '2', 
      email: 'sarah@company.com',
      name: 'Sarah Johnson',
      domain: 'company.com',
      status: 'active' as const,
      dailyLimit: 300,
      currentSent: 89,
      warmupProgress: 100,
      healthScore: 87,
      lastActivity: new Date(),
      createdAt: new Date()
    },
    {
      id: '3',
      email: 'mike@company.com',
      name: 'Mike Wilson',
      domain: 'company.com',
      status: 'inactive' as const,
      dailyLimit: 200,
      currentSent: 0,
      warmupProgress: 0,
      healthScore: 92,
      lastActivity: new Date(),
      createdAt: new Date()
    }
  ];

  const initiallySelectedEmails = editingMode
    ? (campaign as CampaignFormValues)?.selectedMailboxes?.map((m: Mailbox) => m.email) || []
    : [];

  const handleMailboxToggle = (
    mailbox: (typeof mailboxes)[0],
    checked: boolean
  ) => {
    if (editingMode && initiallySelectedEmails.includes(mailbox.email)) {
      return;
    }

    if (checked) {
      setValue("selectedMailboxes", [...selectedMailboxes, mailbox]);
    } else {
      setValue(
        "selectedMailboxes",
        selectedMailboxes.filter((m) => m.email !== mailbox.email)
      );
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto space-y-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Assign Mailboxes
          </h2>
          <p className="text-muted-foreground">
            Select which mailboxes will send emails for this campaign
          </p>
        </CardHeader>

        <CardContent className="grid gap-4">
          {editingMode && (
            <Alert className="mb-4 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium text-inherit">
                You can add new mailboxes to this active campaign, but cannot
                remove mailboxes that are already assigned and actively sending
                emails.
              </AlertDescription>
            </Alert>
          )}

          {mailboxes.map((mailbox) => {
            const isSelected =
              selectedMailboxes.some((m) => m.email === mailbox.email) ||
              initiallySelectedEmails.includes(mailbox.email);
            const isInitiallySelected =
              editingMode && initiallySelectedEmails.includes(mailbox.email);
            const isDisabled = editingMode && isInitiallySelected;

            return (
              <Label
                key={mailbox.id}
                className={`flex items-center p-6 border-2 rounded-xl transition-all bg-muted/50 dark:bg-muted/30 border-border ${
                  isDisabled
                    ? "opacity-75 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md hover:border-border/80 has-aria-checked:border-green-500 has-aria-checked:bg-green-50 dark:has-aria-checked:bg-green-500/20"
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleMailboxToggle(mailbox, checked as boolean)
                  }
                  disabled={isDisabled}
                  className="w-5 h-5 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white disabled:opacity-50"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-foreground">
                      {mailbox.email}
                      {isInitiallySelected && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                          (Active)
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          mailbox.status === "active"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400"
                            : "bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-400"
                        }`}
                      >
                        {mailbox.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {mailbox.dailyLimit} emails/day
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">
                      Health Score: {mailbox.healthScore}%
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        mailbox.healthScore >= 90
                          ? "bg-green-500"
                          : mailbox.healthScore >= 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              </Label>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
export default MailboxAssignmentStep;
