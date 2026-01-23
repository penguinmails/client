'use server';

import { NextRequest } from 'next/server';
import { ActionResult } from '@/types';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  leadCount: number;
  contacts: number;
  tags?: string[];
  status?: 'active' | 'inactive' | 'used' | 'being-used';
  campaign?: string;
  bounced?: number;
  performance?: { openRate: number; replyRate: number };
  uploadDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mock data
const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    status: 'active',
    tags: ['vip', 'enterprise'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    company: 'Tech Solutions',
    status: 'prospect',
    tags: ['tech', 'potential'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

export async function getClients(_req?: NextRequest) {
  return {
    success: true,
    data: mockClients
  };
}

export async function getClientById(id: string, _req?: NextRequest) {
  const client = mockClients.find(c => c.id === id);
  return {
    success: !!client,
    data: client
  };
}

export async function createClient(data: Partial<Client>, _req?: NextRequest) {
  const newClient: Client = {
    id: Date.now().toString(),
    name: data.name || '',
    email: data.email || '',
    phone: data.phone,
    company: data.company,
    status: data.status || 'prospect',
    tags: data.tags || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    success: true,
    data: newClient
  };
}

export async function updateClient(id: string, data: Partial<Client>, _req?: NextRequest) {
  return {
    success: true,
    data: { ...data, id, updatedAt: new Date() }
  };
}

export async function deleteClient(_id: string, _req?: NextRequest) {
  return {
    success: true,
    message: 'Client deleted successfully'
  };
}

export async function removeFromCampaign(_clientId: string, _campaignId: string, _req?: NextRequest) {
  return {
    success: true,
    message: 'Client removed from campaign successfully'
  };
}

export async function maskClientPII(_clientId: string, _req?: NextRequest) {
  return {
    success: true,
    message: 'Client PII masked successfully'
  };
}

// Lead List Actions
import { leadLists } from '../data/mock';

import { listSegmentsAction } from '@/features/marketing';

export async function getLeadLists(_req?: NextRequest): Promise<ActionResult<LeadList[]>> {
  try {
    const result = await listSegmentsAction({ limit: 100 });
    
    if (!result.success) {
      return {
        success: false,
        error: (result as any).error || "Failed to fetch segments from Mautic"
      };
    }

    const data: LeadList[] = result.data.data.map(segment => ({
      id: segment.id.toString(),
      name: segment.name,
      description: segment.description || '',
      leadCount: segment.contactCount,
      contacts: segment.contactCount,
      status: segment.isPublished ? 'active' : 'inactive',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error fetching lead lists:", error);
    return {
      success: false,
      error: "Failed to fetch segments"
    };
  }
}

export async function getLeadsLists(req?: NextRequest) {
  return getLeadLists(req);
}

export async function getLeadsByListId(_listId: string, _req?: NextRequest): Promise<ActionResult<LeadList[]>> {
  return {
    success: true,
    data: []
  };
}

export async function createLeadList(_data: Partial<LeadList>, _req?: NextRequest): Promise<ActionResult<LeadList>> {
  return {
    success: true,
    data: {
      id: Date.now().toString(),
      name: _data.name || 'New List',
      description: _data.description || '',
      leadCount: 0,
      contacts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
}

export async function updateLeadList(_id: string, _data: Partial<LeadList>, _req?: NextRequest): Promise<ActionResult<LeadList>> {
  return {
    success: true,
    data: {
      id: _id,
      name: _data.name || 'Updated List',
      description: _data.description || '',
      leadCount: 0,
      contacts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
}

export async function deleteLeadList(_id: string, _req?: NextRequest): Promise<ActionResult<void>> {
  return {
    success: true,
    data: undefined as unknown as void
  };
}

export async function getLeadListById(id: string, _req?: NextRequest): Promise<ActionResult<LeadList>> {
  return {
    success: true,
    data: {
      id,
      name: 'Sample List',
      description: 'Sample description',
      leadCount: 0,
      contacts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
}

export async function createLead(_data: Partial<Record<string, unknown>>, _req?: NextRequest): Promise<ActionResult<Record<string, unknown>>> {
  return {
    success: true,
    data: { id: Date.now().toString(), ..._data }
  };
}

export async function updateLead(_id: string, _data: Partial<Record<string, unknown>>, _req?: NextRequest): Promise<ActionResult<Record<string, unknown>>> {
  return {
    success: true,
    data: { id: _id, ..._data }
  };
}

export async function deleteLead(_id: string, _req?: NextRequest): Promise<ActionResult<void>> {
  return {
    success: true,
    data: undefined as unknown as void
  };
}
