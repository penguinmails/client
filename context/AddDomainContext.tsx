"use client";

import { CheckCircle, Globe, Server } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const steps = [
  {
    number: 1,
    title: "step1.title",
    subtitle: "step1.subtitle",
    icon: Globe,
    color: "bg-blue-500 text-white",
  },
  {
    number: 2,
    title: "step2.title",
    subtitle: "step2.subtitle",
    icon: Server,
    color: "bg-purple-500 text-white",
  },
  {
    number: 3,
    title: "step3.title",
    subtitle: "step3.subtitle",
    icon: CheckCircle,
    color: "bg-green-500 text-white",
  },
];

const dnsRecords: DNSRecord[] = [
  {
    type: "SPF",
    name: "@",
    value: "v=spf1 include:penguinmails.com ~all",
    status: "pending",
    description: "spf",
  },
  {
    type: "DKIM",
    name: "penguin._domainkey",
    value:
      "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7vbqajDw4o6gJy8ousKZQrBqj...",
    status: "pending",
    description: "dkim",
  },
  {
    type: "DMARC",
    name: "_dmarc",
    value: "v=DMARC1; p=none; rua=mailto:dmarc@penguinmails.com",
    status: "pending",
    description: "dmarc",
  },
  {
    type: "MX",
    name: "@",
    value: "mx.penguinmails.com",
    status: "pending",
    description: "mx",
  },
];

export const AddDomainContext = createContext<{
  steps: typeof steps;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  dnsRecords: typeof dnsRecords;
  currentStepData: (typeof steps)[0];
} | null>(null);

const addDomainFormSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(255, "Domain is too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/,
      "Please enter a valid domain name"
    ),
  dnsRecords: z.array(
    z.object({
      type: z.enum(["SPF", "DKIM", "DMARC", "MX"]),
      name: z.string(),
      value: z.string(),
      status: z.enum(["verified", "pending", "failed"]),
      description: z.string(),
    })
  ),
});

type AddDomainFormType = z.infer<typeof addDomainFormSchema>;

export function AddDomainProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<AddDomainFormType>({
    defaultValues: {
      domain: "",
      dnsRecords: [],
    },
  });
  const currentStepData =
    steps.find((step) => step.number === currentStep) || steps[0];

  return (
    <AddDomainContext.Provider
      value={{
        steps,
        currentStep,
        setCurrentStep,
        dnsRecords,
        currentStepData,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </AddDomainContext.Provider>
  );
}

export function useAddDomainContext() {
  const context = useContext(AddDomainContext);
  if (!context) {
    throw new Error(
      "useAddDomainContext must be used within AddDomainProvider"
    );
  }
  return context;
}

export type DNSRecord = {
  type: "SPF" | "DKIM" | "DMARC" | "MX";
  name: string;
  value: string;
  status: "verified" | "pending" | "failed";
  description: string;
};

export { addDomainFormSchema, type AddDomainFormType };