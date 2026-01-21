"use client";

import { useAddDomainContext } from "@/context/AddDomainContext";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { createDomain } from "@features/domains/ui/integration/domains-api";
import { useServerAction } from "@/hooks/use-server-action";
import { useRouter } from "@/lib/config/i18n/navigation";
import { DNSRecord } from "@/context/AddDomainContext";

export default function NewDomainNavigation() {
  const { currentStep, setCurrentStep, dnsRecords } = useAddDomainContext();
  const form = useFormContext();
  const t = useTranslations("domains.new");
  const { toast } = useToast();
  const router = useRouter();
  const { execute: createDomainAction, loading: isPending } = useServerAction(createDomain);

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger("domain");
      if (!isValid) return;
      
      // Set DNS records in form
      form.setValue("dnsRecords", dnsRecords);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Verify DNS records (in real implementation, this would check actual DNS)
      const dnsData = form.getValues("dnsRecords");
      const allVerified = dnsData.every((record: DNSRecord) => record.status === "verified");
      
      if (!allVerified) {
        toast({
          variant: "destructive",
          title: t("dns.error.title"),
          description: t("dns.error.description"),
        });
        return;
      }
      
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const domain = form.getValues("domain");
    const result = await createDomainAction({ domain });

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
      description: t("success.description", { domain }),
    });

    router.push("/dashboard/domains");
  };

  return (
    <div className="flex justify-between w-full">
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={currentStep === 1}
      >
        {t("navigation.back")}
      </Button>
      
      {currentStep === 3 ? (
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? t("form.submitting") : t("navigation.finish")}
        </Button>
      ) : (
        <Button onClick={handleNext} disabled={isPending}>
          {isPending ? t("form.submitting") : t("navigation.next")}
        </Button>
      )}
    </div>
  );
}