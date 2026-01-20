import {
    Globe,
    Mail,
    Send,
    Zap,
    Users,
} from 'lucide-react';
import { OnboardingStep, FAQItem } from '@/types/onboarding';

export const getOnboardingSteps = (
  t: (key: string) => string
): OnboardingStep[] => [
  {
    id: 1,
    title: t('Onboarding.steps.step1.title'),
    subtitle: t('Onboarding.steps.step1.subtitle'),
    explanation: t('Onboarding.steps.step1.explanation'),
    icon: Globe,
    color: 'bg-blue-500',
    href: '/en/dashboard/domains',
    buttonText: t('Onboarding.steps.step1.buttonText'),
    kbLink: 'https://docs.penguinmails.com/guides/domain-setup',
    videoId: null,
    videoUrl: 'https://www.youtube.com/watch?v=domain-setup-guide',
    completed: false,
  },
  {
    id: 2,
    title: t('Onboarding.steps.step2.title'),
    subtitle: t('Onboarding.steps.step2.subtitle'),
    explanation: t('Onboarding.steps.step2.explanation'),
    icon: Mail,
    color: 'bg-purple-500',
    href: '/en/dashboard/mailboxes',
    buttonText: t('Onboarding.steps.step2.buttonText'),
    kbLink: 'https://docs.penguinmails.com/guides/mailbox-setup',
    videoId: null,
    videoUrl: 'https://www.youtube.com/watch?v=mailbox-setup-guide',
    completed: false,
  },
  {
    id: 3,
    title: t('Onboarding.steps.step3.title'),
    subtitle: t('Onboarding.steps.step3.subtitle'),
    explanation: t('Onboarding.steps.step3.explanation'),
    icon: Zap,
    color: 'bg-orange-500',
    href: '/en/dashboard/warmup',
    buttonText: t('Onboarding.steps.step3.buttonText'),
    kbLink: 'https://docs.penguinmails.com/guides/warmup',
    videoId: null,
    videoUrl: 'https://www.youtube.com/watch?v=warmup-guide',
    completed: false,
  },
  {
    id: 4,
    title: t('Onboarding.steps.step4.title'),
    subtitle: t('Onboarding.steps.step4.subtitle'),
    explanation: t('Onboarding.steps.step4.explanation'),
    icon: Users,
    color: 'bg-green-500',
    href: '/en/dashboard/leads',
    buttonText: t('Onboarding.steps.step4.buttonText'),
    kbLink: 'https://docs.penguinmails.com/guides/csv-format',
    videoId: null,
    videoUrl: 'https://www.youtube.com/watch?v=leads-upload-guide',
    completed: false,
    promotion: {
      title: t('Onboarding.promotion.leads.title'),
      description: t('Onboarding.promotion.leads.description'),
      link: 'https://penguinmails.com/services/lead-generation',
    },
  },
  {
    id: 5,
    title: t('Onboarding.steps.step5.title'),
    subtitle: t('Onboarding.steps.step5.subtitle'),
    explanation: t('Onboarding.steps.step5.explanation'),
    icon: Send,
    color: 'bg-emerald-500',
    href: '/en/dashboard/campaigns/create',
    buttonText: t('Onboarding.steps.step5.buttonText'),
    kbLink: 'https://docs.penguinmails.com/guides/campaign-setup',
    videoId: null,
    videoUrl: 'https://www.youtube.com/watch?v=campaign-setup-guide',
    completed: false,
    promotion: {
      title: t('Onboarding.promotion.copy.title'),
      description: t('Onboarding.promotion.copy.description'),
      link: 'https://penguinmails.com/services/copywriting',
    },
  },
];

export const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'How long does the setup process take?',
    answer:
      'Most users complete the entire onboarding in 30-60 minutes. Domain verification can take up to 24 hours, but you can continue with other steps while waiting.',
  },
  {
    id: 2,
    question: 'Do I need technical knowledge to set this up?',
    answer:
      'Not at all! Our step-by-step guides and video tutorials walk you through everything. For DNS setup, you might need access to your domain registrar, but we provide exact instructions.',
  },
  {
    id: 3,
    question: 'Can I skip steps and come back later?',
    answer:
      'While you can navigate away at any time, we recommend completing steps in order for the best experience. Each step builds on the previous one.',
  },
  {
    id: 4,
    question: 'What if I get stuck on a step?',
    answer:
      'Use the "Need Help?" button below to access our help center, or contact our support team. We\'re here to help you succeed!',
  },
];
