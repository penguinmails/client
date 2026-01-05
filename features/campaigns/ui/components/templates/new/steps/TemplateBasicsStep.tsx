"use client";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAddTemplateContext } from "@features/campaigns/ui/context/add-template-context";
import { ArrowLeft, ArrowRight } from "lucide-react";

function TemplateBasicsStep() {
  const { form, setCurrentStep } = useAddTemplateContext();

  const handleNext = async () => {
    const isValid = await form.trigger(["name", "category"]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Template Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              placeholder="Enter template name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.watch("category") || ""}
              onValueChange={(value) =>
                form.setValue("category", value as "OUTREACH" | "INTRODUCTION" | "FOLLOW_UP" | "MEETING" | "VALUE" | "SAAS" | "AGENCY" | "CONSULTING" | "ECOMMERCE" | "REAL_ESTATE" | "HR" | "FINANCE" | "HEALTHCARE")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUTREACH">Outreach</SelectItem>
                <SelectItem value="INTRODUCTION">Introduction</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="VALUE">Value</SelectItem>
                <SelectItem value="SAAS">SaaS</SelectItem>
                <SelectItem value="AGENCY">Agency</SelectItem>
                <SelectItem value="CONSULTING">Consulting</SelectItem>
                <SelectItem value="ECOMMERCE">Ecommerce</SelectItem>
                <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-500">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Folder and Tags sections removed - not in current schema */}
          {/* Favorite section removed - not in current schema */}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="size-4" />
              <span>Discard</span>
            </Button>
            <Button onClick={handleNext}>
              <span>Next</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemplateBasicsStep;