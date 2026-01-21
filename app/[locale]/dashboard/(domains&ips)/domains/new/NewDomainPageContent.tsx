"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/config/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createDomain } from "@features/domains/ui/integration/domains-api";
import { useServerAction } from "@/hooks/use-server-action";

const domainFormSchema = z.object({
  domain: z
    .string()
    .min(1, { message: "Domain is required" })
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, {
      message: "Please enter a valid domain name (e.g., example.com)",
    }),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

export default function NewDomainPageContent() {
  const t = useTranslations("domains.new");
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domain: "",
    },
    mode: "onChange",
  });

  const { execute: createDomainAction, loading: isPending } =
    useServerAction(createDomain);

  const onSubmit = async (values: DomainFormValues) => {
    const result = await createDomainAction({ domain: values.domain });

    if (result?.error) {
      toast({
        variant: "destructive",
        title: t("error.title"),
        description: result.error,
      });
      return;
    }

    toast({
      title: t("success.title"),
      description: t("success.description", { domain: values.domain }),
    });

    router.push("/dashboard/domains");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit" disabled={isPending}>
                {isPending ? t("form.submitting") : t("form.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
