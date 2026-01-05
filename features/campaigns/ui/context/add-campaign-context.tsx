'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { CampaignFormValues } from '@/types';
import { 
  Users, 
  Mail, 
  Calendar, 
  Settings, 
  CheckCircle, 
  FileText 
} from 'lucide-react';

export interface CampaignStep {
  id: string;
  name: string;
  completed: boolean;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface AddCampaignContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  form: UseFormReturn<CampaignFormValues>;
  steps: CampaignStep[];
  currentStepData: CampaignStep;
  isStepValid: (stepIndex: number) => boolean;
  editingMode?: boolean;
  campaign?: CampaignFormValues | null; // For editing existing campaigns
  nextStep: () => void;
  prevStep: () => void;
}

const AddCampaignContext = createContext<AddCampaignContextType | undefined>(undefined);

const steps: CampaignStep[] = [
  { 
    id: 'details', 
    name: 'Campaign Details', 
    completed: false,
    number: 1,
    title: 'Campaign Details',
    subtitle: 'Set up basic campaign information',
    icon: FileText,
    color: 'bg-blue-500'
  },
  { 
    id: 'leads', 
    name: 'Select Leads', 
    completed: false,
    number: 2,
    title: 'Select Leads',
    subtitle: 'Choose your target audience',
    icon: Users,
    color: 'bg-green-500'
  },
  { 
    id: 'sequence', 
    name: 'Email Sequence', 
    completed: false,
    number: 3,
    title: 'Email Sequence',
    subtitle: 'Create your email flow',
    icon: Mail,
    color: 'bg-purple-500'
  },
  { 
    id: 'mailboxes', 
    name: 'Assign Mailboxes', 
    completed: false,
    number: 4,
    title: 'Assign Mailboxes',
    subtitle: 'Configure sending accounts',
    icon: Settings,
    color: 'bg-orange-500'
  },
  { 
    id: 'schedule', 
    name: 'Schedule Settings', 
    completed: false,
    number: 5,
    title: 'Schedule Settings',
    subtitle: 'Set timing and frequency',
    icon: Calendar,
    color: 'bg-indigo-500'
  },
  { 
    id: 'review', 
    name: 'Review & Launch', 
    completed: false,
    number: 6,
    title: 'Review & Launch',
    subtitle: 'Final review and launch',
    icon: CheckCircle,
    color: 'bg-emerald-500'
  }
];

export function AddCampaignProvider({ 
  children, 
  initialData,
  editingMode = false,
  campaign 
}: { 
  children: ReactNode;
  initialData?: Partial<CampaignFormValues>;
  editingMode?: boolean;
  campaign?: CampaignFormValues | null;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = useForm<CampaignFormValues>({
    defaultValues: {
      name: initialData?.name || '',
      fromName: initialData?.fromName || '',
      fromEmail: initialData?.fromEmail || '',
      status: initialData?.status || 'DRAFT',
      clients: initialData?.clients || [],
      steps: initialData?.steps || [],
      ...initialData
    }
  });

  const isStepValid = (_stepIndex: number): boolean => {
    // Mock validation logic
    return true;
  };

  const currentStepData = steps[currentStep] || steps[0];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AddCampaignContext.Provider value={{
      currentStep,
      setCurrentStep,
      form,
      steps,
      currentStepData,
      isStepValid,
      editingMode,
      campaign,
      nextStep,
      prevStep
    }}>
      {children}
    </AddCampaignContext.Provider>
  );
}

export function useAddCampaignContext() {
  const context = useContext(AddCampaignContext);
  if (!context) {
    throw new Error('useAddCampaignContext must be used within AddCampaignProvider');
  }
  return context;
}