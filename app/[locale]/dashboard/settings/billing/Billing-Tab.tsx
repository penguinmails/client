"use client";

import { ChangePlanTrigger } from "@features/billing/ui/components/change-plan-dialog";
import EditAddressTrigger from "@features/billing/ui/components/edit-trigger-dialog";
import InvoicesTable from "@features/billing/ui/components/invocies-table";
import UpdateCardDialogTrigger from "@features/billing/ui/components/update-card-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/shared/utils";
import {
  CreditCard,
  Crown,
  Building,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  getBillingDataForSettings,
  updateBillingInfo,
} from "@features/billing/actions";
import { updateCompanyInfo, getUserSettings } from "@features/settings/actions";
import {
  useServerAction,
  useServerActionWithParams,
} from "@/shared/hooks/use-server-action";
import { BillingLoadingSkeleton } from "@features/billing/ui/components/BillingLoadingSkeleton";
import {
  SettingsErrorBoundary,
  SettingsErrorFallback,
} from "@/features/settings";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";
import { useStripeCheckout } from "@features/billing/lib/hooks/use-stripe-checkout";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/shared/config/i18n/navigation";
import CheckoutDialog from "@features/billing/ui/components/checkout-dialog";
import { useTranslations } from "next-intl";

function BillingTab() {
  const t = useTranslations("BillingTab");
  const { handleCheckoutForPlan, isCheckoutLoading } = useStripeCheckout();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const checkout = searchParams.get("checkout");

  // Memoized options to keep stable references
  const billingOptions = useMemo(
    () => ({
      onError: (error: string) => {
        toast.error(t("errors.loadBilling"), { description: error });
      },
    }),
    [t]
  );

  // Server action hooks
  const billingDataAction = useServerAction(
    getBillingDataForSettings,
    billingOptions
  );
  const { execute: loadBilling } = billingDataAction;

  const updateOptions = useMemo(
    () => ({
      onSuccess: () => {
        toast.success(t("success.billingUpdated"));
        // Refresh billing data after update
        loadBilling();
      },
      onError: (error: string) => {
        toast.error(t("errors.updateBilling"), {
          description: error,
        });
      },
    }),
    [loadBilling, t]
  );

  const updateBillingAction = useServerActionWithParams(
    updateBillingInfo,
    updateOptions
  );

  const updateCompanyOptions = useMemo(
    () => ({
      onSuccess: () => {
        toast.success(t("success.companyUpdated"));
        // Refresh billing data in case it includes company info
        loadBilling();
      },
      onError: (error: string) => {
        toast.error(t("errors.updateCompany"), {
          description: error,
        });
      },
    }),
    [loadBilling, t]
  );

  const updateCompanyAction = useServerActionWithParams(
    updateCompanyInfo,
    updateCompanyOptions
  );

  const companyOptions = useMemo(
    () => ({
      onError: (error: string) => {
        toast.error(t("errors.loadCompany"), {
          description: error,
        });
      },
    }),
    [t]
  );

  const companyDataAction = useServerAction(getUserSettings, companyOptions);
  const { execute: loadCompanyData } = companyDataAction;

  // Load billing data on component mount
  useEffect(() => {
    loadBilling();
    loadCompanyData();
  }, [loadBilling, loadCompanyData]);

  // Handle company name update
  const handleCompanyNameUpdate = async (newName: string) => {
    if (!billingDataAction.data) return;

    await updateCompanyAction.execute({
      name: newName,
    });
    // Refresh company data after update
    loadCompanyData();
  };

  useEffect(() => {
    if (typeof checkout === "string")
      setTimeout(() => {
        router.push(pathname);
      }, 2000);
  }, [checkout, router, pathname]);

  // Show loading skeleton while data is loading
  if (billingDataAction.loading && !billingDataAction.data) {
    return <BillingLoadingSkeleton />;
  }

  // Show error state if data failed to load
  if (billingDataAction.error && !billingDataAction.data) {
    return (
      <SettingsErrorFallback
        error={
          typeof billingDataAction.error === "string"
            ? billingDataAction.error
            : t("errors.errorOccurred")
        }
        retry={loadBilling}
      />
    );
  }

  // Show fallback if no data available
  if (!billingDataAction.data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{t("errors.noData")}</p>
          <Button
            onClick={() => loadBilling()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  const billingData = billingDataAction.data;

  return (
    <SettingsErrorBoundary>
      <div className="space-y-5">
        {/* Current Plan Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t("currentPlan")}</CardTitle>
            <Badge>
              <Crown className="w-4 h-4 mr-1" />
              <span>{t("active")}</span>
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <Card
                className={cn(
                  "border-primary/70 bg-linear-to-br from-primary/20 to-indigo-50"
                )}
              >
                <CardContent>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {t("planDetails", {
                      planName: billingData.planDetails.name,
                    })}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {t("price", {
                      price: billingData.planDetails.price,
                      period: billingData.planDetails.isMonthly
                        ? t("period.month")
                        : t("period.year"),
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    {t("emailAccounts")}
                  </h4>
                  <p className="text-xl font-semibold text-foreground">
                    {billingData.emailAccountsUsed} /{" "}
                    {billingData.planDetails.maxEmailAccounts === 0
                      ? "∞"
                      : billingData.planDetails.maxEmailAccounts}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    {t("campaigns")}
                  </h4>
                  <p className="text-xl font-semibold text-foreground">
                    {billingData.campaignsUsed} /{" "}
                    {billingData.planDetails.maxCampaigns === 0
                      ? "∞"
                      : billingData.planDetails.maxCampaigns}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="ml-auto">
            <ChangePlanTrigger
              title={t("changePlan")}
              onSelectPlan={handleCheckoutForPlan}
              isLoading={isCheckoutLoading}
            />
          </CardFooter>
        </Card>

        <CheckoutDialog
          isModalOpen={typeof checkout === "string"}
          checkout={checkout}
          setIsModalOpen={() => router.push(pathname)}
        />

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("paymentMethod")}</CardTitle>
          </CardHeader>
          <CardContent>
            {billingData.paymentMethod ? (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white dark:bg-card p-2 rounded-lg border dark:border-border">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-foreground">
                      {billingData.paymentMethod.brand} {t("endingIn")}{" "}
                      {billingData.paymentMethod.lastFour}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                      {t("expires", {
                        expiry: billingData.paymentMethod.expiry,
                      })}
                    </p>
                  </div>
                </div>
                <UpdateCardDialogTrigger title={t("updateCard")} />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white dark:bg-card p-2 rounded-lg border dark:border-border">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("noPaymentMethod")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("addPaymentMethod")}
                    </p>
                  </div>
                </div>
                <UpdateCardDialogTrigger title={t("addCard")} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              <Building className="w-5 h-5 inline mr-2" />
              {t("companyInformation")}
            </CardTitle>
            <button
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              disabled={updateBillingAction.loading}
              onClick={() => {
                const currentName =
                  companyDataAction.data?.companyInfo.name || t("company");
                const newCompanyName = prompt(
                  t("companyName") + ":",
                  currentName
                );
                if (
                  newCompanyName &&
                  newCompanyName.trim() &&
                  newCompanyName.trim() !== currentName
                ) {
                  handleCompanyNameUpdate(newCompanyName.trim());
                }
              }}
            >
              {updateBillingAction.loading ? t("updating") : t("editCompany")}
            </button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-muted/30 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-foreground">
                      {t("companyName")}
                    </label>
                    <p className="font-medium text-gray-900 dark:text-foreground">
                      {companyDataAction.data?.companyInfo.name || t("loading")}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-foreground">
                    {t("industry")}
                  </label>
                  <p className="text-gray-600">
                    {companyDataAction.data?.companyInfo.industry ||
                      t("technologyServices")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-foreground">
                    {t("companySize")}
                  </label>
                  <p className="text-gray-600">
                    {companyDataAction.data?.companyInfo.size ||
                      t("companySizeDefault")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Card */}
        <Card>
          <CardHeader className="flex-center-between">
            <CardTitle>{t("billingAddress")}</CardTitle>
            <EditAddressTrigger title={t("editAddress")} />
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-muted/30 rounded-lg p-4">
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-foreground">
                  {companyDataAction.data?.companyInfo.name || t("company")}
                </p>
                <p className="text-gray-600 dark:text-muted-foreground">
                  {t("street")}
                </p>
                <p className="text-gray-600 dark:text-muted-foreground">
                  {t("city")}
                </p>
                <p className="text-gray-600 dark:text-muted-foreground">
                  {t("country")}
                </p>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-2">
                  {t("vatId")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentInvoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicesTable />
          </CardContent>
        </Card>

        {/* Loading overlay for updates */}
        {updateBillingAction.loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card p-4 rounded-lg shadow-lg flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{t("loadingOverlay")}</span>
            </div>
          </div>
        )}
      </div>
    </SettingsErrorBoundary>
  );
}

export default BillingTab;
