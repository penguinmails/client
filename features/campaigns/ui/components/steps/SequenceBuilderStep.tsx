"use client";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddCampaignContext } from "@features/campaigns/ui/context/add-campaign-context";
import { CampaignEventCondition, CampaignEventConditionType } from "@features/campaigns/types";
import { CampaignStep } from "@features/campaigns/types";

import { Clock, Mail, Zap, AlertTriangle } from "lucide-react";
import { useState } from "react";
import EmailStep, { EmailStep as EmailStepType } from "./components/sequence-email";

function SequenceBuilderStep() {
  const { form } = useAddCampaignContext();
  const { setValue, watch } = form;
  const sequence = watch("steps") || [];
  const [focusedTextareaIndex, setFocusedTextareaIndex] = useState<number | null>(null);
  const addEmailStep = () => {
    const newStep = {
      id: Date.now(),
      sequenceOrder: sequence.length + 1,
      delayDays: sequence.length > 0 ? 1 : 0,
      delayHours: 0,
      templateId: 0,
      campaignId: 0,
      emailSubject: "",
      emailBody: "",
      condition: sequence.length > 0 ? CampaignEventCondition.IF_NOT_REPLIED : CampaignEventCondition.ALWAYS,
      type: "email" as const,
    };
    setValue("steps", [...sequence, newStep]);
  };

  const addWaitStep = () => {
    const newStep = {
      id: Date.now(),
      sequenceOrder: sequence.length + 1,
      delayDays: 2,
      delayHours: 0,
      templateId: 0,
      campaignId: 0,
      emailSubject: "",
      emailBody: "",
      condition: CampaignEventCondition.ALWAYS,
      type: "wait" as const,
    };
    setValue("steps", [...sequence, newStep]);
  };
  const updateStep = (index: number, updates: Partial<CampaignStep> | Partial<EmailStepType>) => {
    // Convert EmailStep updates to CampaignStep format
    const normalizedUpdates: Partial<CampaignStep> = {};


    // Handle updates based on their type
    if ("emailSubject" in updates || "emailBody" in updates || "condition" in updates) {
      // This is likely a CampaignStep update
      Object.assign(normalizedUpdates, updates);
    } else {
      // This is likely an EmailStepType update - convert it
      if ("subject" in updates && updates.subject !== undefined) {
        normalizedUpdates.emailSubject = updates.subject;
      }
      if ("content" in updates && updates.content !== undefined) {
        normalizedUpdates.emailBody = updates.content;
      }
      if ("condition" in updates && updates.condition !== undefined) {
        const conditionMap: Record<string, CampaignEventConditionType> = {
          "always": CampaignEventCondition.ALWAYS,
          "no_reply": CampaignEventCondition.IF_NOT_REPLIED,
        };

        if (typeof updates.condition === "string") {
          const mappedCondition = conditionMap[updates.condition];
          if (mappedCondition) {
            normalizedUpdates.condition = mappedCondition;
          }
        }
      }
    }

    const updatedSequence = sequence.map((step, i) =>
      i === index ? { ...step, ...normalizedUpdates } : step
    );
    setValue("steps", updatedSequence);
  };

  const removeStep = (index: number) => {
    const updatedSequence = sequence.filter((_, i) => i !== index);
    setValue("steps", updatedSequence);
  };

  // Check for sequence flow issues
  const getSequenceIssues = () => {
    const issues = [];
    for (let i = 0; i < sequence.length - 1; i++) {
      if (sequence[i].delayDays === 0 && sequence[i + 1].delayDays === 0) {
        issues.push({
          type: "consecutive_emails",
          stepIndex: i + 1,
          message: `Step ${i + 2}: Two emails in a row without a delay may cause delivery issues`,
        });
      }
    }
    return issues;
  };

  const sequenceIssues = getSequenceIssues();

  return (
    <>
      <Card className="bg-card dark:bg-card rounded-2xl shadow-sm border border-border p-8">
        <CardHeader className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Build Email Sequence
          </h2>
          <p className="text-muted-foreground">
            Create your email flow with personalized messages and timing
          </p>
        </CardHeader>

        <div className="flex justify-center space-x-4 mb-8">
          <Button
            type="button"
            onClick={addEmailStep}
            className="px-6 py-3 bg-orange-600 dark:bg-orange-500 text-white rounded-xl hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Mail className="w-5 h-5" />
            <span>Add Email</span>
          </Button>
          <Button
            type="button"
            onClick={addWaitStep}
            className="px-6 py-3 bg-gray-600 dark:bg-muted text-white rounded-xl hover:bg-gray-700 dark:hover:bg-muted/80 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Clock className="w-5 h-5" />
            <span>Add Wait</span>
          </Button>
        </div>
      </Card>

      {/* Sequence Issues Warning */}
      {sequenceIssues.length > 0 && (
        <Alert className="border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-400">
            <div className="font-medium mb-1">Sequence Issues Detected</div>
            {sequenceIssues.map((issue, index) => (
              <div key={index} className="text-sm">
                {issue.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {sequence.map((step, index) => (
          <div key={step.id || index}>
            <EmailStep
              step={{
                ...step,
                subject: step.emailSubject,
                content: step.emailBody
              }}
              index={index}
              updateStep={updateStep}
              removeStep={removeStep}
              focusedTextareaIndex={focusedTextareaIndex}
              setFocusedTextareaIndex={setFocusedTextareaIndex}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default SequenceBuilderStep;
