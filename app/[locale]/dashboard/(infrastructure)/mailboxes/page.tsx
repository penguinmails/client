import { listMailboxes } from "@features/mailboxes/actions";
import { MailboxesTable } from "@features/mailboxes/ui/components/mailboxes-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";

export const dynamic = 'force-dynamic';

/**
 * Mailboxes Page - Server Component
 * 
 * Fetches all mailboxes from HestiaCP across all domains.
 */
export default async function MailboxesPage() {
  const result = await listMailboxes();
  const mailboxes = result.success && result.data ? result.data : [];

  // Calculate aggregate stats
  const totalAccounts = mailboxes.length;
  const activeAccounts = mailboxes.filter(m => m.status === 'active').length;
  const warmingAccounts = mailboxes.filter(m => m.status === 'warming').length;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Mailboxes</h1>
          <p className="text-muted-foreground">
            Centralized inventory of all email accounts across your domains.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(mailboxes.map(m => m.domainId)).size} domains
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active & Healthy</CardTitle>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warming Up</CardTitle>
            <div className="h-2 w-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warmingAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Automated reputation building
            </p>
          </CardContent>
        </Card>
      </div>

      <MailboxesTable data={mailboxes} />
    </div>
  );
}
