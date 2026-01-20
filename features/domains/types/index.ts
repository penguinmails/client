import { z } from "zod";

// ============================================================
// Enums & Constants
// ============================================================

// DNS Record Types
export type DNSRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "TXT"
  | "SPF"
  | "DKIM"
  | "DMARC"
  | "NS"
  | "SRV";

export type DNSRecordStatus = "verified" | "pending" | "failed";

// Domain Statuses
export type DomainStatus =
  | "PENDING"
  | "VERIFIED"
  | "SETUP_REQUIRED"
  | "FAILED"
  | "DELETED";

// Email Account Statuses
export type EmailAccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "ISSUE"
  | "SUSPENDED"
  | "DELETED";

export const ACCOUNT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "ISSUE",
  "SUSPENDED",
  "DELETED",
] as const;

// Verification Status
export enum VerificationStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  ERROR = "ERROR",
  NOT_CONFIGURED = "NOT_CONFIGURED",
  DISABLED = "DISABLED",
}

export const VerificationStatusConstants = {
  VERIFIED: "VERIFIED",
  PENDING: "PENDING",
  ERROR: "ERROR",
  NOT_CONFIGURED: "NOT_CONFIGURED",
  DISABLED: "DISABLED",
} as const;

// Relay Types
export enum RelayType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
  DEFAULT_SERVER_CONFIG = "DEFAULT_SERVER_CONFIG",
}

export const RelayTypeConstants = {
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
  DEFAULT_SERVER_CONFIG: "DEFAULT_SERVER_CONFIG",
} as const;

// Account Creation Types
export enum DomainAccountCreationType {
  LINUX_USER = "LINUX_USER",
  VIRTUAL_USER_DB = "VIRTUAL_USER_DB",
}

export const DomainAccountCreationTypeConstants = {
  LINUX_USER: "LINUX_USER",
  VIRTUAL_USER_DB: "VIRTUAL_USER_DB",
} as const;

export enum WarmupStatus {
  NOT_STARTED = "NOT_STARTED",
  WARMING = "WARMING",
  WARMED = "WARMED",
  PAUSED = "PAUSED",
}

export type WarmupStatusType = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

// DNS Provider Enums
export enum DNSProvider {
  CLOUDFLARE = "Cloudflare",
  GODADDY = "GoDaddy",
  NAMECHEAP = "Namecheap",
  AMAZON_ROUTE53 = "Amazon Route 53",
  DIGITAL_OCEAN = "DigitalOcean",
  BLUEHOST = "Bluehost",
  HOSTINGER = "Hostinger",
  HOSTGATOR = "HostGator",
  OTHER = "Other",
}

// ============================================================
// Interfaces
// ============================================================

export interface DNSRecord {
  type: DNSRecordType | string;
  name: string;
  value: string;
  status: DNSRecordStatus | "verified" | "pending" | "failed";
  description: string;
  priority?: number;
}

// Core Domain interface
export interface Domain {
  id: number;
  domain: string;
  name?: string;
  provider?: string;
  status: DomainStatus | string;
  daysActive?: number;
  reputation?: number;
  emailAccounts?: number;
  mailboxes?: number; // Compat
  spf?: boolean | string;
  dkim?: boolean | string;
  dmarc?: boolean | string;
  records?: {
    spf: string | DNSRecordStatus;
    dkim: string | DNSRecordStatus;
    dmarc: string | DNSRecordStatus;
    mx: string | DNSRecordStatus;
  };
  metrics?: {
    total24h: number;
    bounceRate: number;
    spamRate: number;
    openRate: number;
    replyRate: number;
  };
  createdAt?: string;
  updatedAt?: string;
  addedDate?: string; // Compat
  companyId?: number;
  createdById?: string;
}

// Domain for full DB operations
export interface DomainDB extends Required<Pick<Domain, 'id' | 'domain' | 'status' | 'createdAt' | 'updatedAt' | 'companyId' | 'createdById'>> {
  id: number;
  domain: string;
  name?: string;
  provider?: string;
  status: DomainStatus;
  daysActive?: number;
  reputation?: number;
  emailAccounts?: number;
  spf?: boolean;
  dkim?: boolean;
  dmarc?: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
}

// Domain for mock/development data
export interface DomainMock {
  id: number;
  domain: string;
  status: string;
  mailboxes: number;
  records: {
    spf: string;
    dkim: string;
    dmarc: string;
    mx: string;
  };
  addedDate: string;
  name?: string;
  provider?: string;
  daysActive?: number;
  reputation?: number;
}

// Domain analytics
export interface DomainAnalytics {
  id: number;
  domain: string;
  status: DomainStatus | string;
  daysActive: number;
  reputation: number;
  emailAccounts: number;
  spf: boolean | string;
  dkim: boolean | string;
  dmarc: boolean | string;
  provider: string;
  totalEmailsSent?: number;
  dailyVolume?: number;
  bounceRate?: number;
  complaintRate?: number;
}

// Email Account
export interface EmailAccount {
  id: number;
  email: string;
  provider: string;
  status: EmailAccountStatus;
  reputation: number;
  warmupStatus: WarmupStatus;
  dayLimit: number;
  sent24h: number;
  lastSync: string;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
  accountType?: DomainAccountCreationType;
  domainAuthStatus?: {
    spfVerified: boolean;
    dkimVerified: boolean;
    dmarcVerified: boolean;
  };
}


export type DomainOrMock = Domain | DomainMock;
export type DomainOrDB = Domain | DomainDB | DomainMock;

// Type guards
export const isDomainMock = (domain: DomainOrMock): domain is DomainMock => {
  return 'records' in domain && typeof domain.records === 'object';
};

export const isDomainDB = (domain: DomainOrDB): domain is DomainDB => {
  return 'companyId' in domain && 'createdById' in domain && typeof domain.createdAt === 'string';
};

// Configuration Interfaces
export interface SPFConfig {
  enabled: boolean;
  record: string;
  policy: "strict" | "soft" | "neutral";
}

export interface DKIMConfig {
  enabled: boolean;
  selector: string;
  key: string;
}

export interface DMARCConfig {
  enabled: boolean;
  policy: "none" | "quarantine" | "reject";
  percentage: number;
  reportEmail: string;
  record: string;
}

export interface DomainAuthentication {
  spf: SPFConfig;
  dkim: DKIMConfig;
  dmarc: DMARCConfig;
}

export interface WarmupConfig {
  enabled: boolean;
  initialDailyVolume: number;
  dailyIncrease: number;
  maxDailyEmails: number;
  warmupSpeed: "slow" | "moderate" | "fast";
  replyRate: string;
  threadDepth: string;
  autoAdjustWarmup: boolean;
}

export interface ReputationFactors {
  bounceRate: number;
  spamComplaints: number;
  engagement: number;
}

export interface DomainSettings {
  domain: string;
  authentication: DomainAuthentication;
  warmup: WarmupConfig;
  reputationFactors: ReputationFactors;
  provider: DNSProvider;
  warmupEnabled?: boolean;
  dailyIncrease?: number;
  maxDailyEmails?: number;
  initialDailyVolume?: number;
  warmupSpeed?: "slow" | "moderate" | "fast";
  replyRate?: string;
  threadDepth?: string;
  autoAdjustWarmup?: boolean;
}

// ============================================================
// Schemas
// ============================================================

const DOMAIN_REGEX =
  /^[a-zA-Z0-9-]{1,63}(?:\.[a-zA-Z0-9-]{1,63})+$/;

export const AddDomainFormSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(255, "Domain is too long")
    .regex(DOMAIN_REGEX, "Please enter a valid domain name"),
  dnsRecords: z.array(
    z.object({
      type: z.enum([
        "SPF",
        "DKIM",
        "DMARC",
        "MX",
        "CNAME",
        "TXT",
        "A",
        "AAAA",
        "NS",
        "SRV",
      ]),
      name: z.string(),
      value: z.string(),
      status: z.enum(["verified", "pending", "failed"]),
      description: z.string(),
      priority: z.number().optional(),
    }),
  ),
});

export type AddDomainFormValues = z.infer<typeof AddDomainFormSchema>;

export const DomainSettingsSchema = z.object({
  provider: z.nativeEnum(DNSProvider),
  warmupEnabled: z.boolean(),
  initialDailyVolume: z.number().min(1),
  dailyIncrease: z.number().min(1),
  maxDailyEmails: z.number().min(1),
  warmupSpeed: z.enum(["slow", "moderate", "fast"]),
  replyRate: z.string(),
  threadDepth: z.string(),
  autoAdjustWarmup: z.boolean(),
});

export type DomainSettingsFormValues = z.infer<typeof DomainSettingsSchema>;


// Email account form schema
export const EmailAccountFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  provider: z.string(), // Keep as string for now to match UI expectation, but validate if possible
  status: z.enum(ACCOUNT_STATUSES).default("PENDING"),
  reputation: z.number().min(0).max(100).default(100),
  warmupStatus: z.nativeEnum(WarmupStatus).default(WarmupStatus.NOT_STARTED),
  dayLimit: z.number().min(1).max(2000).default(100),
  sent24h: z.number().default(0),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  accountType: z.nativeEnum(DomainAccountCreationType).default(DomainAccountCreationType.VIRTUAL_USER_DB),
  accountSmtpAuthStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.NOT_CONFIGURED).optional(),
  relayType: z.nativeEnum(RelayType).default(RelayType.DEFAULT_SERVER_CONFIG),
  relayHost: z.string().optional(),
  virtualMailboxMapping: z.string().optional(),
  mailboxPath: z.string().optional(),
  mailboxQuotaMB: z.number().positive().optional(),
  warmupDailyIncrement: z.number().positive().optional(),
  warmupTargetDailyVolume: z.number().positive().optional(),
  accountSetupStatus: z.string().optional(),
  accountDeliverabilityStatus: z.string().optional(),
});


export type EmailAccountFormValues = z.infer<typeof EmailAccountFormSchema>;

export interface EmailAccountFormProps {
  initialData?: Partial<EmailAccount>;
  onSubmit: (data: EmailAccountFormValues) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
}

