"use client";

import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, Plus, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { iconContainerStyles, iconTextColors } from "@/lib/config/design-tokens";
import { cn } from "@/lib/utils";

function QuickActions() {
  const t = useTranslations("QuickActions");
  const btnStyle = "w-full justify-start h-fit gap-3 p-3 text-left hover:bg-accent rounded-lg";

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-foreground">{t("title")}</h3>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className={btnStyle}
          asChild
        >
          <Link href="/dashboard/campaigns/create">
            <div className={cn("size-8 flex items-center justify-center", iconContainerStyles.blue)}>
              <Plus className={cn("size-4", iconTextColors.blue)} />
            </div>
            <span className="font-medium text-foreground">
              {t("createCampaign")}
            </span>
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={btnStyle}
          asChild
        >
          <Link href="/dashboard/leads">
            <div className={cn("size-8 flex items-center justify-center", iconContainerStyles.green)}>
              <Upload className={cn("size-4", iconTextColors.green)} />
            </div>
            <span className="font-medium text-foreground">
              {t("uploadLeads")}
            </span>
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={btnStyle}
          asChild
        >
          <Link href="/dashboard/domains/new">
            <div className={cn("size-8 flex items-center justify-center", iconContainerStyles.purple)}>
              <Globe className={cn("size-4", iconTextColors.purple)} />
            </div>
            <span className="font-medium text-foreground">{t("addDomain")}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
export default QuickActions;
