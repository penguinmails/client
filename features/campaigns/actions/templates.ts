'use server';

import { NextRequest } from 'next/server';
import { FormHandlerParams, FormHandlerResult } from '@/shared/api/types';
import { Template as TemplateType, TemplateFolder as TemplateFolderType } from 'entities/template';

// Use the standardized types from types/templates.ts
export type Template = TemplateType;
export type TemplateFolder = TemplateFolderType;

// Mock data
const mockFolders: TemplateFolder[] = [
  {
    id: 1,
    name: 'Sales Templates',
    type: 'template',
    templateCount: 5,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 1
  },
  {
    id: 2,
    name: 'Marketing Templates',
    type: 'template',
    templateCount: 8,
    isExpanded: false,
    children: [],
    parentId: undefined,
    order: 2
  }
];

const mockTemplates: Template[] = [
  {
    id: 1,
    name: 'Welcome Email',
    body: 'Hello {{first_name}}, welcome to our platform!',
    bodyHtml: '<p>Hello {{first_name}}, welcome to our platform!</p>',
    subject: 'Welcome to {{company_name}}!',
    category: 'OUTREACH',
    folderId: 2,
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
  }
];

export async function getTemplateFolders(_req?: NextRequest): Promise<FormHandlerResult<TemplateFolder[]>> {
  return {
    success: true,
    data: mockFolders
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
    templates: mockTemplates.filter(t => t.type === 'template').length,
    quickReplies: mockTemplates.filter(t => t.type === 'quick-reply').length,
    folders: mockFolders.length
  };
}
