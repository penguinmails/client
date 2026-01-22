"use client";

import { Suspense } from "react";
import NewDomainHeaderDetails from "@/components/domains/new/NewDomainHeaderDetails";
import NewDomainNavigation from "@/components/domains/new/NewDomainNavigation";
import NewDomainStep from "@/components/domains/new/NewDomainStep";
import NewDomainStepper from "@/components/domains/new/NewDomainStepper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AddDomainProvider } from "@/context/AddDomainContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const dynamic = "force-dynamic";

function NewDomainPage() {
  const t = useTranslations("domains.new");
  return (
    <AddDomainProvider>
      <Card>
        <CardHeader className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={"/dashboard/domains"}>
                  <ArrowLeft className="w-6 h-6" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
              </div>
            </div>
            <NewDomainHeaderDetails />
          </div>
        </CardHeader>

        <CardContent>
          <NewDomainStepper />
          <NewDomainStep />
        </CardContent>
        <CardFooter>
          <NewDomainNavigation />
        </CardFooter>
      </Card>
    </AddDomainProvider>
  );
}

export default function WrappedNewDomainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewDomainPage />
    </Suspense>
  );
}
