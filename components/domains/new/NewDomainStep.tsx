"use client";

import { useAddDomainContext } from "@/context/AddDomainContext";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { DNSRecord } from "@/context/AddDomainContext";
import { cn } from "@/lib/utils";

export default function NewDomainStep() {
  const { currentStep, dnsRecords } = useAddDomainContext();
  const form = useFormContext();
  const t = useTranslations("domains.new");
  const tDns = useTranslations("domains.dns");

  if (currentStep === 1) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.domain.label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.domain.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 2) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("dns.title")}</CardTitle>
          <CardDescription>{t("dns.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dnsRecords.map((record: DNSRecord) => (
              <div key={record.type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{record.type}</span>
                <span className={cn("px-2 py-1 rounded text-xs", {
                  "bg-green-100 text-green-800": record.status === "verified",
                  "bg-red-100 text-red-800": record.status === "failed",
                  "bg-yellow-100 text-yellow-800": record.status === "pending",
                })}>
                    {record.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {tDns(`descriptions.${record.description}`)}
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <Input value={record.name} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Value</label>
                    <Input value={record.value} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 3) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">{t("confirmation.title")}</CardTitle>
          <CardDescription>{t("confirmation.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-lg font-medium">{form.getValues("domain")}</p>
            <p className="text-muted-foreground mt-2">
              {t("confirmation.message")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}