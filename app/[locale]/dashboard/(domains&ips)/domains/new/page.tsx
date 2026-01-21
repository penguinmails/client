import { useTranslations } from "next-intl";
import { AddDomainProvider } from "@features/domains/ui/context/add-domain-context";
import { FormProvider, useForm } from "react-hook-form";
import NewDomainStepper from "@features/domains/ui/components/new/NewDomainStepper";
import NewDomainStep from "@features/domains/ui/components/new/NewDomainStep";
import NewDomainNavigation from "@features/domains/ui/components/new/NewDomainNavigation";
import NewDomainHeaderDetails from "@features/domains/ui/components/new/NewDomainHeaderDetails";
import { Button } from "@/components/ui/button/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DomainFormValues {
  domain: string;
}

export default function NewDomainPage() {
  const t = useTranslations("domains.new");

  // Initialize react-hook-form synchronously (must be called at the top level)
  const form = useForm<DomainFormValues>({
    defaultValues: {
      domain: "",
    },
    mode: "onChange",
  });

  return (
    <FormProvider {...form}>
      <AddDomainProvider>
        <div className="container mx-auto max-w-4xl py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/domains">
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </Button>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <NewDomainStepper />
          </div>

          {/* Step Header Details */}
          <div className="mb-6">
            <NewDomainHeaderDetails />
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <NewDomainStep />
          </div>

          {/* Navigation */}
          <NewDomainNavigation />
        </div>
      </AddDomainProvider>
    </FormProvider>
  );
}
