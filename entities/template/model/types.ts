export interface Template {
  id: number;
  name: string;
  body: string;
  bodyHtml: string;
  subject: string;
  content?: string;
  category: TemplateCategoryType;
  folderId?: number | null;
  usage?: number;
  openRate?: string;
  replyRate?: string;
  lastUsed?: string;
  isStarred?: boolean;
  type?: "quick-reply" | "template";
  companyId: number;
  description: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateFolder {
  id: number;
  name: string;
  type: "quick-reply" | "template";
  templateCount: number;
  isExpanded: boolean;
  children: (Template | TemplateFolder)[];
  parentId?: number;
  order?: number;
}

export type TemplateCategoryType =
  | "OUTREACH"
  | "INTRODUCTION"
  | "FOLLOW_UP"
  | "MEETING"
  | "VALUE"
  | "SAAS"
  | "AGENCY"
  | "CONSULTING"
  | "ECOMMERCE"
  | "REAL_ESTATE"
  | "HR"
  | "FINANCE"
  | "HEALTHCARE";

export const TemplateCategory = {
  OUTREACH: "OUTREACH",
  INTRODUCTION: "INTRODUCTION",
  FOLLOW_UP: "FOLLOW_UP",
  MEETING: "MEETING",
  VALUE: "VALUE",
  SAAS: "SAAS",
  AGENCY: "AGENCY",
  CONSULTING: "CONSULTING",
  ECOMMERCE: "ECOMMERCE",
  REAL_ESTATE: "REAL_ESTATE",
  HR: "HR",
  FINANCE: "FINANCE",
  HEALTHCARE: "HEALTHCARE",
} as const;

// Personalization tag types
export interface PersonalizationTag {
  id: number;
  name: string;
  tag: string;
}

// Quick reply type (alias for Template with quick-reply type)
export type QuickReply = Template & {
  type: "quick-reply";
};
