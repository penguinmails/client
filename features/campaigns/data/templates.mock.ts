// Mock data for templates
export interface MockTemplate {
  id: number;
  name: string;
  body: string;
  bodyHtml: string;
  subject: string;
  category: string;
  folderId?: number;
  usage: number;
  openRate: string;
  replyRate: string;
  lastUsed: string;
  isStarred: boolean;
  type: 'template' | 'quick-reply';
  companyId: number;
  description: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export const initialTemplates: MockTemplate[] = [
  {
    id: 1,
    name: 'Welcome Email',
    body: 'Hello {{first_name}}, welcome to our platform!',
    bodyHtml: '<p>Hello {{first_name}}, welcome to our platform!</p>',
    subject: 'Welcome to {{company_name}}!',
    category: 'OUTREACH',
    folderId: 1,
    usage: 10,
    openRate: '45.2%',
    replyRate: '12.8%',
    lastUsed: '2024-01-15',
    isStarred: false,
    type: 'template',
    companyId: 1,
    description: 'Welcome email template for new users',
    createdById: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'Follow-up Message',
    body: 'Hi {{first_name}}, just following up on our previous conversation...',
    bodyHtml: '<p>Hi {{first_name}}, just following up on our previous conversation...</p>',
    subject: 'Following up',
    category: 'FOLLOW_UP',
    folderId: 1,
    usage: 25,
    openRate: '38.7%',
    replyRate: '8.4%',
    lastUsed: '2024-01-20',
    isStarred: true,
    type: 'template',
    companyId: 1,
    description: 'Follow-up template for nurturing leads',
    createdById: 'user1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 7,
    name: 'Thanks for reaching out',
    body: 'Thank you for your message. I appreciate you taking the time to contact us.',
    bodyHtml: '<p>Thank you for your message. I appreciate you taking the time to contact us.</p>',
    subject: 'Re: Your inquiry',
    category: 'QUICK_REPLY',
    usage: 45,
    openRate: '0%',
    replyRate: '0%',
    lastUsed: '2024-01-25',
    isStarred: false,
    type: 'quick-reply',
    companyId: 1,
    description: 'Quick reply for general inquiries',
    createdById: 'user1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25')
  }
];