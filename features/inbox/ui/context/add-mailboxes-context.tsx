'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MailboxStep {
  id: string;
  name: string;
  completed: boolean;
}

export interface MailboxFormData {
  email: string;
  password: string;
  imapServer: string;
  imapPort: number;
  smtpServer: string;
  smtpPort: number;
  useSSL: boolean;
  domainId: string;
}

interface BaseStepperContextType {
  setCurrentStep: (step: number) => void;
  steps: { number: number; title: string; completed: boolean }[];
  currentStep: number;
}

interface AddMailboxesContextType extends BaseStepperContextType {
  formData: MailboxFormData;
  updateFormData: (data: Partial<MailboxFormData>) => void;
  mailboxSteps: MailboxStep[];
  isStepValid: (stepIndex: number) => boolean;
  currentStepData?: {
    title: string;
    description: string;
    subtitle?: string;
    icon?: unknown;
    color?: string;
  };
}

export const AddMailboxesContext = createContext<AddMailboxesContextType | null>(null);

const defaultFormData: MailboxFormData = {
  email: '',
  password: '',
  imapServer: '',
  imapPort: 993,
  smtpServer: '',
  smtpPort: 587,
  useSSL: true,
  domainId: ''
};

const steps: MailboxStep[] = [
  { id: 'credentials', name: 'Email Credentials', completed: false },
  { id: 'settings', name: 'Server Settings', completed: false },
  { id: 'test', name: 'Test Connection', completed: false }
];

export function AddMailboxesProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MailboxFormData>(defaultFormData);

  const updateFormData = (data: Partial<MailboxFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return formData.email.length > 0 && formData.password.length > 0;
      case 1:
        return formData.imapServer.length > 0 && formData.smtpServer.length > 0;
      case 2:
        return true; // Test step validation would be based on connection test
      default:
        return false;
    }
  };

  const currentStepData = {
    title: steps[currentStep]?.name || '',
    description: 'Configure your mailbox settings',
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
    <AddMailboxesContext.Provider value={{
      currentStep,
      setCurrentStep,
      formData,
      updateFormData,
      steps: stepperSteps,
      mailboxSteps: steps,
      isStepValid,
      currentStepData
    }}>
      {children}
    </AddMailboxesContext.Provider>
  );
}

export function useAddMailboxesContext() {
  const context = useContext(AddMailboxesContext);
  if (!context) {
    throw new Error('useAddMailboxesContext must be used within AddMailboxesProvider');
  }
  return context;
}