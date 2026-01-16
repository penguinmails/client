'use server';

import { NextRequest } from 'next/server';
import { FormHandlerParams, FormHandlerResult } from '@/types';
import { Template as TemplateType, TemplateFolder as TemplateFolderType } from '@/types/templates';

// Use the standardized types from types/templates.ts
export type Template = TemplateType;
export type TemplateFolder = TemplateFolderType;

// Mock data matching the reference design
const mockFolders: TemplateFolder[] = [
  // Template folders (for My Templates tab)
  {
    id: 1,
    name: 'Cold Outreach',
    type: 'template',
    templateCount: 2,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 1
  },
  {
    id: 2,
    name: 'Follow-ups',
    type: 'template',
    templateCount: 1,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 2
  },
  {
    id: 3,
    name: 'Product Demo',
    type: 'template',
    templateCount: 0,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 3
  },
  {
    id: 4,
    name: 'Partnerships',
    type: 'template',
    templateCount: 0,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 4
  },
  // Quick Reply folders (for Quick Replies tab)
  {
    id: 5,
    name: 'Common Responses',
    type: 'quick-reply',
    templateCount: 2,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 1
  },
  {
    id: 6,
    name: 'Objection Handling',
    type: 'quick-reply',
    templateCount: 0,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 2
  }
];

const mockTemplates: Template[] = [
  {
    id: 1,
    name: 'Cold Outreach - SaaS',
    body: 'Hi {{first_name}}, I noticed {{company}} is growing fast. Quick question about your current workflow...',
    bodyHtml: '<p>Hi {{first_name}}, I noticed {{company}} is growing fast. Quick question about your current workflow...</p>',
    subject: 'Quick question about {{company}} workflow',
    category: 'OUTREACH',
    folderId: 1,
    usage: 847,
    openRate: '34.2%',
    replyRate: '8.6%',
    lastUsed: '2 hours ago',
    isStarred: false,
    type: 'template',
    companyId: 1,
    description: 'Cold outreach template for SaaS companies',
    createdById: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 6,
    name: 'Cold Outreach - E-commerce',
    body: 'Hi {{first_name}}, I saw that {{company}} has been expanding. Our solution could help boost your sales...',
    bodyHtml: '<p>Hi {{first_name}}, I saw that {{company}} has been expanding. Our solution could help boost your sales...</p>',
    subject: 'Boost {{company}} sales with our solution',
    category: 'OUTREACH',
    folderId: 1,
    usage: 425,
    openRate: '31.8%',
    replyRate: '7.2%',
    lastUsed: '1 day ago',
    isStarred: false,
    type: 'template',
    companyId: 1,
    description: 'Cold outreach template for e-commerce companies',
    createdById: 'user1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 2,
    name: 'Follow-up #1',
    body: 'Hi {{first_name}}, I wanted to follow up on my previous email about {{company}}...',
    bodyHtml: '<p>Hi {{first_name}}, I wanted to follow up on my previous email about {{company}}...</p>',
    subject: 'Following up on my previous email',
    category: 'FOLLOW_UP',
    folderId: 2,
    usage: 523,
    openRate: '28.9%',
    replyRate: '12.3%',
    lastUsed: '1 day ago',
    isStarred: false,
    type: 'template',
    companyId: 1,
    description: 'First follow-up email template',
    createdById: 'user1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  // Quick replies (for Quick Replies tab folders)
  {
    id: 101,
    name: 'Thanks for your interest',
    body: "Thanks for your interest! I'll send over more details shortly.",
    bodyHtml: "<p>Thanks for your interest! I'll send over more details shortly.</p>",
    subject: 'Thanks for your interest',
    category: 'OUTREACH',
    folderId: 5, // Common Responses folder
    usage: 156,
    openRate: '42.1%',
    replyRate: '18.5%',
    lastUsed: '3 hours ago',
    isStarred: false,
    type: 'quick-reply',
    companyId: 1,
    description: 'Quick reply for interested prospects',
    createdById: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 102,
    name: 'Schedule a call',
    body: "I'd be happy to schedule a quick call to discuss this further. What does your calendar look like next week?",
    bodyHtml: "<p>I'd be happy to schedule a quick call to discuss this further. What does your calendar look like next week?</p>",
    subject: 'Schedule a call',
    category: 'OUTREACH',
    folderId: 5, // Common Responses folder
    usage: 89,
    openRate: '38.7%',
    replyRate: '22.3%',
    lastUsed: '1 day ago',
    isStarred: false,
    type: 'quick-reply',
    companyId: 1,
    description: 'Quick reply to schedule a call',
    createdById: 'user1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

export async function getTemplateFolders(_req?: NextRequest): Promise<FormHandlerResult<TemplateFolder[]>> {
  // Populate children with templates that belong to each folder
  const foldersWithChildren = mockFolders.map(folder => ({
    ...folder,
    children: mockTemplates.filter(template => template.folderId === folder.id)
  }));
  
  return {
    success: true,
    data: foldersWithChildren
  };
}

export async function getTemplates(
  params?: FormHandlerParams<{folderId?: string | number}>
): Promise<Template[]> {
  const data = params?.data || {};
  let templates = mockTemplates;
  if (data.folderId) {
    const folderIdNum = typeof data.folderId === 'string' ? parseInt(data.folderId, 10) : data.folderId;
    templates = templates.filter(t => t.folderId === folderIdNum);
  }

  return templates;
}

export async function createTemplate(
  params: FormHandlerParams<Partial<Template>>
): Promise<FormHandlerResult<Template>> {
  const { data } = params;
  const newTemplate: Template = {
    id: Date.now(),
    name: data.name || '',
    body: data.body || '',
    bodyHtml: data.bodyHtml || '',
    subject: data.subject || '',
    category: data.category || 'OUTREACH',
    folderId: data.folderId,
    usage: 0,
    openRate: '0%',
    replyRate: '0%',
    lastUsed: new Date().toISOString(),
    isStarred: false,
    type: 'template',
    companyId: 1,
    description: data.description || '',
    createdById: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    success: true,
    data: newTemplate
  };
}

export async function updateTemplate(
  params: FormHandlerParams<{id: string | number; data: Partial<Template>}> | FormData
): Promise<FormHandlerResult<Template> | void> {
  let templateId: number;
  let updateData: Partial<Template>;
  
  if (params instanceof FormData) {
    // Handle FormData case for form action
    templateId = parseInt(params.get('id') as string, 10);
    updateData = {
      name: params.get('name') as string,
      subject: params.get('subject') as string,
      body: params.get('body') as string,
      bodyHtml: params.get('bodyHtml') as string
    };
    
    // For form actions, just update and return void
    const _updatedTemplate: Template = {
      ...mockTemplates[0],
      ...updateData,
      id: templateId,
      updatedAt: new Date()
    };
    
    // Return void for form actions
    return;
  } else {
    // Handle FormHandlerParams case
    const { data } = params;
    templateId = typeof data.id === 'string' ? parseInt(data.id, 10) : data.id;
    updateData = data.data;
    
    const updatedTemplate: Template = {
      ...mockTemplates[0],
      ...updateData,
      id: templateId,
      updatedAt: new Date()
    };
    
    return {
      success: true,
      data: updatedTemplate
    };
  }
}

export async function deleteTemplate(
  params: FormHandlerParams<{id: string | number}>
): Promise<FormHandlerResult<{message: string}>> {
  const { data: _data } = params;
  return {
    success: true,
    data: { message: 'Template deleted successfully' }
  };
}

export async function getTemplateById(
  params: FormHandlerParams<{id: string | number}> | string | number
): Promise<Template | null> {
  let templateId: number;
  
  if (typeof params === 'string' || typeof params === 'number') {
    templateId = typeof params === 'string' ? parseInt(params, 10) : params;
  } else {
    const { data } = params;
    templateId = typeof data.id === 'string' ? parseInt(data.id, 10) : data.id;
  }
  
  const template = mockTemplates.find(t => t.id === templateId);
  return template || null;
}

export async function getTabCounts(_req?: NextRequest): Promise<Record<string, number>> {
  return {
    templates: 3, // Reference shows My Templates (3)
    'quick-replies': 2, // Reference shows Quick Replies (2)
    gallery: 0, // Reference shows Gallery (0)
    folders: mockFolders.length
  };
}
