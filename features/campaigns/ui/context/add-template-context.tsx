'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { TemplateFormValues } from '@/types';

export interface TemplateStep {
  id: string;
  name: string;
  completed: boolean;
}

export interface TemplateFormData {
  name: string;
  subject: string;
  body: string;
  category: string;
  description?: string;
}

interface BaseStepperContextType {
  setCurrentStep: (step: number) => void;
  steps: { number: number; title: string; completed: boolean }[];
  currentStep: number;
}

interface AddTemplateContextType extends BaseStepperContextType {
  formData: TemplateFormData;
  updateFormData: (data: Partial<TemplateFormData>) => void;
  templateSteps: TemplateStep[];
  isStepValid: (stepIndex: number) => boolean;
  form: UseFormReturn<TemplateFormValues>;
}

export const AddTemplateContext = createContext<AddTemplateContextType | null>(null);

const defaultFormData: TemplateFormData = {
  name: '',
  subject: '',
  body: '',
  category: 'OUTREACH',
  description: ''
};

const steps: TemplateStep[] = [
  { id: 'basics', name: 'Template Basics', completed: false },
  { id: 'content', name: 'Email Content', completed: false },
  { id: 'success', name: 'Success', completed: false }
];

export function AddTemplateProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  
  const form = useForm<TemplateFormValues>({
    defaultValues: {
      name: '',
      subject: '',
      body: '',
      category: 'OUTREACH',
      description: ''
    }
  });

  const updateFormData = (data: Partial<TemplateFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return formData.name.length > 0;
      case 1:
        return formData.subject.length > 0 && formData.body.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const stepperSteps = steps.map((step, index) => ({
    number: index + 1,
    title: step.name,
    completed: step.completed,
    icon: null as unknown,
    color: 'bg-blue-500'
  }));

  return (
    <AddTemplateContext.Provider value={{
      currentStep,
      setCurrentStep,
      formData,
      updateFormData,
      steps: stepperSteps,
      templateSteps: steps,
      isStepValid,
      form
    }}>
      {children}
    </AddTemplateContext.Provider>
  );
}

export function useAddTemplateContext() {
  const context = useContext(AddTemplateContext);
  if (!context) {
    throw new Error('useAddTemplateContext must be used within AddTemplateProvider');
  }
  return context;
}