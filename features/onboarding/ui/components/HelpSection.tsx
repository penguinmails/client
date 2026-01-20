"use client";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { developmentLogger } from "@/lib/logger";
import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const FAQ_COUNT = 4;

export function HelpSection() {
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const t = useTranslations();

  const handleContactSupport = useCallback(() => {
    developmentLogger.debug("Contact support clicked");
  }, []);

  const handleToggleFAQ = useCallback(() => {
    setShowFAQ(!showFAQ);
  }, [showFAQ]);

  const faqItems = useMemo(
    () =>
      Array.from({ length: FAQ_COUNT }, (_, i) => ({
        id: i + 1,
        question: t(`Onboarding.faq.q${i + 1}`),
        answer: t(`Onboarding.faq.a${i + 1}`),
      })),
    [t]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <HelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="font-semibold">
                {t("Onboarding.help.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("Onboarding.help.description")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleContactSupport}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {t("Onboarding.help.contactSupport")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFAQ}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              {t("Onboarding.help.faq")}
              {showFAQ ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={showFAQ} onOpenChange={setShowFAQ}>
        <CollapsibleContent>
          <Separator />
          <CardContent className="py-4">
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={item.id} className="p-0 rounded-md">
                  <Collapsible
                    open={expandedFAQ === index}
                    onOpenChange={(open) => setExpandedFAQ(open ? index : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                      >
                        <span className="text-sm">{item.question}</span>
                        {expandedFAQ === index ? (
                          <ChevronUp className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3">
                      <Separator className="mb-3" />
                      <p className="text-sm leading-relaxed">{item.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
