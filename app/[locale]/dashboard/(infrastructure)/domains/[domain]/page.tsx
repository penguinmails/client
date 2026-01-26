import { getDomainDetails } from "@features/domains/actions";
import { DnsRecordsTable } from "@features/domains/ui/components/dns-records-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { ShieldCheck, ChevronRight, ExternalLink, Activity, Server, Lock, Info, ShieldAlert, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DomainPageProps {
  params: Promise<{
    domain: string;
    locale: string;
  }>
}

async function DomainDetailPage({ params }: DomainPageProps) {
  const { domain, locale } = await params;

  try {
    const data = await getDomainDetails(domain);
    const { dnsInfo, webInfo, records, subdomains, soa, expirationDate, isStaff, hestiaUrl, mailAccounts } = data;

    return (
      <TooltipProvider>
        <div className="container mx-auto py-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/dashboard/domains`} className="text-muted-foreground hover:text-foreground transition-colors">
                  Domains
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <h1 className="text-3xl font-bold tracking-tight">{domain}</h1>
              </div>
              <p className="text-muted-foreground">
                Detailed infrastructure configuration and associated sub-services.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 mr-2 border-r pr-4 border-muted">
                {dnsInfo && <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900 border">DNS Managed</Badge>}
                {webInfo && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 border">Web Hosted</Badge>}
              </div>

              {isStaff && (
                <Button asChild variant="secondary" size="sm" className="gap-2">
                  <a href={hestiaUrl} target="_blank" rel="noopener noreferrer">
                    <ShieldAlert className="w-4 h-4" />
                    Infrastructure Panel
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">DNS Records ({Object.keys(records).length})</TabsTrigger>
              <TabsTrigger value="subdomains">Subdomains ({subdomains.length})</TabsTrigger>
              <TabsTrigger value="mailboxes">Mailboxes ({mailAccounts ? Object.keys(mailAccounts).length : 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">IP Address</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold truncate">{webInfo?.IP || dnsInfo?.IP || "N/A"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">SOA Record</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          Start of Authority: Essential DNS record that identifies the primary name server and administrative details for the zone.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs font-mono font-medium truncate bg-muted/50 p-2 rounded" title={soa}>{soa || "N/A"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Auto-Renewal</CardTitle>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold flex items-center gap-2">
                      {expirationDate ? (
                        <span className="text-auto">
                          {new Date(expirationDate).toLocaleDateString()}
                        </span>
                      ) : (
                        "Unknown"
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SSL Status</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold flex items-center gap-2">
                      {webInfo?.SSL === 'yes' ? <span className="text-emerald-600 dark:text-emerald-400">Secure</span> : "Unsecured"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Configuration</CardTitle>
                    <CardDescription>Integrity status of critical deliverability records.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['SPF', 'DKIM', 'DMARC', 'MX'].map(type => {
                      const hasRecord = Object.values(records).some(r => {
                        if (type === 'SPF') return r.TYPE === 'TXT' && r.VALUE.includes('v=spf1');
                        if (type === 'DMARC') return r.TYPE === 'TXT' && r.RECORD === '_dmarc';
                        if (type === 'DKIM') return r.TYPE === 'TXT' && r.RECORD.includes('_domainkey');
                        return r.TYPE === type;
                      });

                      return (
                        <div key={type} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                          <div className="flex items-center gap-3">
                            {hasRecord ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <Activity className="w-5 h-5 text-orange-500" />}
                            <span className="font-semibold">{type} Record</span>
                          </div>
                          <Badge variant={hasRecord ? "secondary" : "outline"}>
                            {hasRecord ? "Valid Configuration" : "Configuration Required"}
                          </Badge>
                        </div>
                      );
                    })}
                    <div className="pt-4 mt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-sm">SOA Record Status</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            The Start of Authority record is required for proper DNS zone propagation and authority verification.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Badge variant={soa && soa !== 'N/A' ? "secondary" : "outline"}>
                        {soa && soa !== 'N/A' ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Infrastructure Metadata</CardTitle>
                    <CardDescription>Hosting and server node details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Template:</span>
                      <span className="font-mono">{webInfo?.TPL || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Disk Usage:</span>
                      <span>{webInfo?.U_DISK || "0"} MB</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Monitoring Node:</span>
                      <span className="font-mono">{process.env.SERVER_HOSTNAME || 'Flynet Cloud'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="records" className="mt-6">
              <DnsRecordsTable records={records} />
            </TabsContent>

            <TabsContent value="subdomains" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subdomains.length === 0 ? (
                  <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">No virtual hosts found for this zone.</p>
                  </div>
                ) : (
                  subdomains.map(sub => (
                    <Card key={sub.domain} className="hover:ring-2 hover:ring-primary/20 transition-all cursor-default">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-md font-bold truncate">{sub.domain}</CardTitle>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Web Hosted</Badge>
                          {sub.ssl && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">SSL</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>IP: {sub.ip}</p>
                          <p>PHP: {sub.php}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="mailboxes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Accounts</CardTitle>
                  <CardDescription>Managed mailboxes and storage quotas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted text-muted-foreground uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3">Account</th>
                          <th className="px-4 py-3">Usage / Quota</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {!mailAccounts || Object.keys(mailAccounts).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              No email accounts found for this domain.
                            </td>
                          </tr>
                        ) : (
                          Object.entries(mailAccounts).map(([account, details]: [string, any]) => {
                            const quota = details.QUOTA === 'unlimited' ? '∞' : `${details.QUOTA} MB`;
                            const usage = `${details.U_DISK} MB`;
                            const percent = details.QUOTA !== 'unlimited' && parseInt(details.QUOTA) > 0
                              ? Math.round((parseInt(details.U_DISK) / parseInt(details.QUOTA)) * 100)
                              : 0;

                            return (
                              <tr key={account} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                      {account.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span>{account}@{domain}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span>{usage}</span>
                                      <span className="text-muted-foreground">of {quota}</span>
                                    </div>
                                    {details.QUOTA !== 'unlimited' && (
                                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${percent > 90 ? 'bg-destructive' : 'bg-primary'}`}
                                          style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant={details.STATUS === 'active' ? 'secondary' : 'destructive'}>
                                    {details.STATUS === 'active' ? 'Active' : 'Suspended'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {details.DATE} {details.TIME}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Resource Unavailable</CardTitle>
            <CardDescription>Could not reach the infrastructure provider or the domain does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/${locale}/dashboard/domains`}>Return to Domains</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default DomainDetailPage;

export const dynamic = 'force-dynamic';
