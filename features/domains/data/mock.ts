import { Globe, Mail, Zap } from "lucide-react";

// Unified mock data for infrastructure tabs
export const infrastructureTabs = [
  {
    id: 'domains',
    label: 'Domains',
    count: 2,
    icon: Globe,
  },
  {
    id: 'mailboxes',
    label: 'Mailboxes',
    count: 5,
    icon: Mail,
  },
  {
    id: 'warmup',
    label: 'Warmup Hub',
    count: 3,
    icon: Zap,
  }
];

// For backward compatibility during migration
export const domainTabs = [infrastructureTabs[0]];
export const mailboxTabs = infrastructureTabs.slice(1);
