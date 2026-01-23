import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { Crown, CreditCard, Building, RefreshCw } from "lucide-react";

/**
 * This story showcases the Billing UI components and layout patterns
 * using Design System tokens for spacing and typography.
 * 
 * Note: The actual BillingTab component requires server actions and hooks,
 * so we demonstrate the static UI patterns here.
 */
const meta: Meta = {
  title: "Settings/BillingUI",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;

// Mock billing data for stories
const mockBillingData = {
  planDetails: {
    name: "Professional",
    price: 49,
    isMonthly: true,
    maxEmailAccounts: 25,
    maxCampaigns: 100,
  },
  emailAccountsUsed: 12,
  campaignsUsed: 45,
  paymentMethod: {
    brand: "Visa",
    lastFour: "4242",
    expiry: "12/25",
  },
  companyInfo: {
    name: "Acme Corporation",
    industry: "Technology Services",
    size: "11-50 employees",
  },
};

/**
 * Current Plan Card - Shows subscription details
 */
export const CurrentPlanCard: StoryObj = {
  render: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Current Plan</CardTitle>
        <Badge>
          <Crown className="w-4 h-4 mr-1" />
          <span>Active</span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-primary/70 bg-gradient-to-br from-primary/20 to-indigo-50">
            <CardContent className="pt-6">
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                {mockBillingData.planDetails.name} Plan
              </h3>
              <p className="text-2xl font-bold text-primary">
                ${mockBillingData.planDetails.price}/month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Email Accounts
              </h4>
              <p className="text-xl font-semibold text-foreground">
                {mockBillingData.emailAccountsUsed} / {mockBillingData.planDetails.maxEmailAccounts}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Campaigns
              </h4>
              <p className="text-xl font-semibold text-foreground">
                {mockBillingData.campaignsUsed} / {mockBillingData.planDetails.maxCampaigns}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="ml-auto">
        <Button variant="outline">Change Plan</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Payment Method Card - Shows saved payment method
 */
export const PaymentMethodCard: StoryObj = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-card p-2 rounded-lg border border-border">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {mockBillingData.paymentMethod.brand} ending in {mockBillingData.paymentMethod.lastFour}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires {mockBillingData.paymentMethod.expiry}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">Update Card</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

/**
 * Payment Method Card - No payment method state
 */
export const NoPaymentMethodCard: StoryObj = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-card p-2 rounded-lg border border-border">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                No payment method
              </p>
              <p className="text-sm text-muted-foreground">
                Add a payment method to continue
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">Add Card</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

/**
 * Company Information Card
 */
export const CompanyInfoCard: StoryObj = {
  render: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          <Building className="w-5 h-5 inline mr-2" />
          Company Information
        </CardTitle>
        <Button variant="link" size="sm" className="text-primary">
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Company Name
              </label>
              <p className="font-medium text-foreground">
                {mockBillingData.companyInfo.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Industry
              </label>
              <p className="text-foreground">
                {mockBillingData.companyInfo.industry}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Company Size
              </label>
              <p className="text-foreground">
                {mockBillingData.companyInfo.size}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

/**
 * Billing Address Card
 */
export const BillingAddressCard: StoryObj = {
  render: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Billing Address</CardTitle>
        <Button variant="link" size="sm" className="text-primary">
          Edit Address
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="space-y-1">
            <p className="font-medium text-foreground">Acme Corporation</p>
            <p className="text-muted-foreground">123 Business Street</p>
            <p className="text-muted-foreground">San Francisco, CA 94102</p>
            <p className="text-muted-foreground">United States</p>
            <p className="text-sm text-muted-foreground mt-2">VAT ID: US123456789</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

/**
 * Loading overlay pattern
 */
export const LoadingOverlay: StoryObj = {
  render: () => (
    <div className="relative h-64 bg-muted/20 rounded-lg">
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
        <div className="bg-card p-4 rounded-lg shadow-lg flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Updating...</span>
        </div>
      </div>
    </div>
  ),
};

/**
 * Complete Billing Layout
 */
export const CompleteBillingLayout: StoryObj = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Current Plan</CardTitle>
          <Badge>
            <Crown className="w-4 h-4 mr-1" />
            <span>Active</span>
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-primary/70 bg-gradient-to-br from-primary/20 to-indigo-50">
              <CardContent className="pt-6">
                <h3 className="mb-1 text-lg font-semibold text-foreground">Professional Plan</h3>
                <p className="text-2xl font-bold text-primary">$49/month</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Email Accounts</h4>
                <p className="text-xl font-semibold text-foreground">12 / 25</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Campaigns</h4>
                <p className="text-xl font-semibold text-foreground">45 / 100</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="ml-auto">
          <Button variant="outline">Change Plan</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-card p-2 rounded-lg border border-border">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update Card</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
