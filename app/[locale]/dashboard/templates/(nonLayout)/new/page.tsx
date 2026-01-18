"use client";
import { AddTemplateProvider } from "@features/campaigns/ui/context/add-template-context";
import NewTemplateStepper from "@/features/campaigns/ui/components/templates/new/NewTemplateStepper";
import AddTemplateForm from "@/features/campaigns/ui/components/templates/new/AddTemplateForm";

export const dynamic = "force-dynamic";

function NewTemplatePage() {
  return (
    <AddTemplateProvider>
      <div className="min-h-screen">
        <NewTemplateStepper />
        <AddTemplateForm />
      </div>
    </AddTemplateProvider>
  );
}

export default NewTemplatePage;
