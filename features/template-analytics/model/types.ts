// Usage tracking types
export interface TemplateUsage {
  templateId: number;
  usedAt: Date;
  userId: string;
  campaignId?: number;
  openCount?: number;
  replyCount?: number;
}
