"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    CreditCard,
    Globe,
    Info,
    Minus,
    Plus,
    Share2,
    ShoppingCart
} from "lucide-react";
import { useState } from "react";

interface IPAddress {
  address: string;
  type: "Dedicated" | "Shared";
  assignedDomain?: string;
  status: "Active" | "Unused" | "Reserved" | "Blacklisted";
}

// Mock data - replace with actual data
const mockData = {
  plan: {
    name: "Professional plan",
    dedicatedIpsIncluded: 5,
    dedicatedIpsUsed: 3,
    totalIps: 10,
    availableIps: 2,
  },
  dedicatedIps: [
    {
      address: "192.168.1.100",
      type: "Dedicated" as const,
      assignedDomain: "example.com",
      status: "Active" as const,
    },
    {
      address: "192.168.1.101",
      type: "Dedicated" as const,
      assignedDomain: "blog.example.com",
      status: "Active" as const,
    },
    {
      address: "192.168.1.102",
      type: "Dedicated" as const,
      assignedDomain: "api.example.com",
      status: "Active" as const,
    },
    {
      address: "192.168.1.103",
      type: "Dedicated" as const,
      status: "Unused" as const,
    },
    {
      address: "192.168.1.104",
      type: "Dedicated" as const,
      status: "Reserved" as const,
    },
  ] as IPAddress[],
  sharedPoolIps: [
    {
      address: "203.0.113.10",
      type: "Shared" as const,
      assignedDomain: "shared-site1.com",
      status: "Active" as const,
    },
    {
      address: "203.0.113.11",
      type: "Shared" as const,
      assignedDomain: "shared-site2.com",
      status: "Active" as const,
    },
    {
      address: "203.0.113.12",
      type: "Shared" as const,
      assignedDomain: "shared-site3.com",
      status: "Active" as const,
    },
    {
      address: "203.0.113.13",
      type: "Shared" as const,
      status: "Blacklisted" as const,
    },
    {
      address: "203.0.113.14",
      type: "Shared" as const,
      assignedDomain: "shared-site4.com",
      status: "Active" as const,
    },
  ] as IPAddress[],
};

const getStatusBadgeVariant = (status: IPAddress["status"]) => {
  switch (status) {
    case "Active":
      return "default";
    case "Unused":
      return "secondary";
    case "Reserved":
      return "outline";
    case "Blacklisted":
      return "destructive";
    default:
      return "secondary";
  }
};

export function IPManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const pricePerIp = 15;

  const { plan, dedicatedIps, sharedPoolIps } = mockData;
  const usagePercentage =
    (plan.dedicatedIpsUsed / plan.dedicatedIpsIncluded) * 100;

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity((prev) => prev + 1);
    } else if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const totalPrice = quantity * pricePerIp;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Plan Overview */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Plan includes {plan.dedicatedIpsIncluded} dedicated IPs
            </CardTitle>
            <div className="ml-auto">
              <Badge
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {plan.dedicatedIpsIncluded} IPs included
              </Badge>
            </div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {plan.name} - {plan.dedicatedIpsIncluded} dedicated IPs included
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Used Dedicated IPs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Used Dedicated IPs
              </div>
              <div className="text-2xl font-bold">
                {plan.dedicatedIpsUsed} / {plan.dedicatedIpsIncluded}
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usagePercentage.toFixed(0)}% used
              </p>
            </div>

            {/* Available */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {plan.availableIps}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                IPs remaining
              </p>
            </div>

            {/* Total IPs */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total IPs</div>
              <div className="text-2xl font-bold">{plan.totalIps}</div>
              <p className="text-xs text-muted-foreground">
                Including shared pool
              </p>
            </div>

            {/* Action */}
            <div className="flex flex-col justify-center">
              <div className="mb-2">
                <p className="text-sm font-medium">Need more dedicated IPs?</p>
                <p className="text-xs text-muted-foreground">
                  Add more dedicated IPs to your plan for better performance and
                  isolation.
                </p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy More Dedicated IPs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Address Management */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">IP Address Management</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage all IP addresses across your domains
          </p>
        </div>

        {/* Dedicated IPs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg">
                Dedicated IPs ({dedicatedIps.length} IPs)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned Domain</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dedicatedIps.map((ip) => (
                    <TableRow key={ip.address}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {ip.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                          {ip.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ip.assignedDomain ? (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ip.assignedDomain}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(ip.status)}
                          className={cn(
                            "font-medium",
                            ip.status === "Active" &&
                              "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
                            ip.status === "Reserved" &&
                              "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
                            ip.status === "Blacklisted" &&
                              "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          )}
                        >
                          {ip.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Shared Pool IPs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <CardTitle className="text-lg">
                Shared Pool IPs ({sharedPoolIps.length} IPs)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned Domain</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedPoolIps.map((ip) => (
                    <TableRow key={ip.address}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          {ip.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                        >
                          {ip.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ip.assignedDomain ? (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ip.assignedDomain}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(ip.status)}
                          className={cn(
                            "font-medium",
                            ip.status === "Active" &&
                              "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
                            ip.status === "Reserved" &&
                              "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
                            ip.status === "Blacklisted" &&
                              "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          )}
                        >
                          {ip.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-xl font-semibold">
              Purchase Dedicated IPs
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Number of dedicated IPs
              </label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(false)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold min-w-[3ch] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(true)}
                  className="h-10 w-10 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Price per IP (monthly)
                </span>
                <span className="font-semibold">${pricePerIp}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-semibold">{quantity}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total (monthly)</span>
                <span className="text-xl font-bold">${totalPrice}</span>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Note:
                  </span>
                  <span className="text-blue-700 dark:text-blue-300 ml-1">
                    Dedicated IPs will be automatically assigned and available
                    within 5 minutes of purchase completion.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle purchase logic here
                  console.log(
                    `Purchasing ${quantity} IPs for $${totalPrice}/month`
                  );
                  setIsDialogOpen(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase ${totalPrice}/month
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
