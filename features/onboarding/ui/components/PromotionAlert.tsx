"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import Link from "next/link";

interface PromotionAlertProps {
  promotion: {
    title: string;
    description: string;
    link: string;
  };
}

export function PromotionAlert({ promotion }: PromotionAlertProps) {
  const t = useTranslations();
  return (
    <Alert className="border-blue-200 bg-linear-to-r from-blue-50 to-purple-50">
      <AlertTitle className="flex gap-2 items-center">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <h4 className="font-semibold text-blue-900">{promotion.title}</h4>
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <p className="text-blue-700">{promotion.description}</p>
        <Button className="bg-blue-600 hover:bg-blue-700 ml-4" asChild>
          <Link href={promotion.link} target="_blank" rel="noopener noreferrer">
            {t("Onboarding.promotion.learnMore")}
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
