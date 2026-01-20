export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'domains' | 'campaigns' | 'deliverability' | 'billing';
}

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How do I get started with PenguinMails?',
    answer: 'Start by adding your domain, connecting a mailbox, and creating your first email template. Our onboarding wizard will guide you through each step.',
    category: 'getting-started'
  },
  {
    id: '2',
    question: 'What DNS records do I need to add for my domain?',
    answer: 'You\'ll need to add SPF, DKIM, and DMARC records to your domain\'s DNS settings. We provide the exact records you need during the domain setup process.',
    category: 'domains'
  },
  {
    id: '3',
    question: 'How can I improve my email deliverability?',
    answer: 'Ensure proper DNS setup, warm up your mailboxes gradually, maintain good sender reputation, and follow email best practices like proper list hygiene.',
    category: 'deliverability'
  },
  {
    id: '4',
    question: 'Can I schedule campaigns for later?',
    answer: 'Yes, you can schedule campaigns to send at specific dates and times. You can also set up automated sequences with delays between emails.',
    category: 'campaigns'
  },
  {
    id: '5',
    question: 'What are the pricing plans available?',
    answer: 'We offer flexible pricing based on your sending volume and features needed. Check our pricing page for detailed information about our plans.',
    category: 'billing'
  }
];