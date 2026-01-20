'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DomainStep {
  id: string;
  name: string;
  completed: boolean;
}

export interface DomainFormData {
  domain: string;
  dnsRecords: Array<{
    type: string;
    name: string;
    value: string;
    priority?: number;
  }>;
  verified: boolean;
}

interface BaseStepperContextType {
  setCurrentStep: (step: number) => void;
  steps: { number: number; title: string; completed: boolean }[];
  currentStep: number;
}

interface AddDomainContextType extends BaseStepperContextType {
  formData: DomainFormData;
  updateFormData: (data: Partial<DomainFormData>) => void;
  domainSteps: DomainStep[];
  isStepValid: (stepIndex: number) => boolean;
  setOpen?: (open: boolean) => void;
  dnsRecords: Array<{
    type: 'SPF' | 'DKIM' | 'DMARC' | 'MX';
    name: string;
    value: string;
    priority?: number;
    status: 'pending' | 'verified' | 'failed';
    description: string;
  }>;
  currentStepData?: {
    title: string;
    description: string;
    subtitle?: string;
    icon?: unknown;
    color?: string;
  };
}

export const AddDomainContext = createContext<AddDomainContextType | null>(null);

const defaultFormData: DomainFormData = {
  domain: '',
  dnsRecords: [],
  verified: false
};

const steps: DomainStep[] = [
  { id: 'domain', name: 'Add Domain', completed: false },
  { id: 'dns', name: 'DNS Setup', completed: false },
  { id: 'verify', name: 'Verify Domain', completed: false }
];

export function AddDomainProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DomainFormData>(defaultFormData);
  const [_open, setOpen] = useState(false);

  const updateFormData = (data: Partial<DomainFormData>): void => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return formData.domain.length > 0;
      case 1:
        return formData.dnsRecords.length > 0;
      case 2:
        return formData.verified;
      default:
        return false;
    }
  };

  const dnsRecords = [
    {
      type: 'SPF' as const,
      name: '@',
      value: 'v=spf1 include:_spf.example.com ~all',
      status: 'pending' as const,
      description: 'SPF record helps prevent email spoofing'
    },
    {
      type: 'DKIM' as const,
      name: 'default._domainkey',
      value: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...',
      status: 'pending' as const,
      description: 'DKIM record provides email authentication'
    },
    {
      type: 'DMARC' as const,
      name: '_dmarc',
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com',
      status: 'pending' as const,
      description: 'DMARC record provides email policy enforcement'
    }
  ];

  const currentStepData = {
    title: steps[currentStep]?.name || '',
    description: 'Configure your domain settings',
    subtitle: 'Step details',
    icon: null,
    color: 'bg-blue-500',
  };

  const stepperSteps = steps.map((step, index) => ({
    number: index + 1,
    title: step.name,
    completed: step.completed,
    icon: null,
    color: 'bg-blue-500'
  }));

  return (
    <AddDomainContext.Provider value={{
      currentStep,
      setCurrentStep,
      formData,
      updateFormData,
      steps: stepperSteps,
      domainSteps: steps,
      isStepValid,
      setOpen,
      dnsRecords,
      currentStepData
    }}>
      {children}
    </AddDomainContext.Provider>
  );
}

export function useAddDomainContext() {
  const context = useContext(AddDomainContext);
  if (!context) {
    throw new Error('useAddDomainContext must be used within AddDomainProvider');
  }
  return context;
}