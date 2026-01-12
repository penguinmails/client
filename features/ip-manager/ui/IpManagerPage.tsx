"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { ShieldCheck, Server, AlertCircle } from "lucide-react";

export default function IpManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IP Manager</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your dedicated IP addresses reputation and
            warming status.
          </p>
        </div>
        <Button>
          <Server className="mr-2 h-4 w-4" />
          Add IP Address
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IPs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">100% of total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No IPs Configured</h3>
        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
          You haven&apos;t added any dedicated IP addresses yet. Add an IP to
          start monitoring its reputation.
        </p>
        <Button variant="outline">Learn more about IP Management</Button>
      </Card>
    </div>
  );
}
