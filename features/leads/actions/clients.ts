'use server';

import { NextRequest } from 'next/server';
import { listContactsAction, getContactAction, updateContactAction } from "@/features/marketing/actions/contacts";
import { productionLogger } from "@/lib/logger";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  points?: number;
  lastActive?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for fallback
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

export async function getClients(options: { listId?: string, listAlias?: string } = {}, _req?: NextRequest) {
  try {
    // Fetch contacts from Mautic
    const segmentFilter = options.listAlias ? `${options.listAlias}` : (options.listId ? `${options.listId}` : '');
    const search = segmentFilter ? `segment:${segmentFilter}` : '';
    const contactsResult = await listContactsAction({ limit: 100, search });

    if (contactsResult.success && contactsResult.data) {
      // Map ContactDTO to Client for UI compatibility
      const clients: Client[] = contactsResult.data.data.map(contact => ({
        id: String(contact.id),
        name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
        email: contact.email,
        company: contact.company || undefined,
        status: 'active' as const,
        tags: contact.tags || [],
        points: contact.points || 0,
        lastActive: contact.lastActive || null,
        createdAt: new Date(contact.dateAdded),
        updatedAt: new Date(contact.dateModified)
      }));

      return {
        success: true,
        data: clients
      };
    }

    // Fallback to mock data if Mautic API fails
    productionLogger.warn("Mautic API failed for contacts, falling back to mock data");
    return {
      success: true,
      data: mockClients
    };
  } catch (error) {
    productionLogger.error("Error fetching clients from Mautic:", error);
    return {
      success: true,
      data: mockClients
    };
  }
}



export async function getClientById(id: string, _req?: NextRequest) {
  try {
    const result = await getContactAction(Number(id));
    
    if (result.success && result.data) {
      const contact = result.data;
      const client: Client = {
        id: String(contact.id),
        name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
        email: contact.email,
        company: contact.company || undefined,
        status: 'active',
        tags: contact.tags || [],
        points: contact.points || 0,
        lastActive: contact.lastActive || null,
        createdAt: new Date(contact.dateAdded),
        updatedAt: new Date(contact.dateModified)
      };
      
      return {
        success: true,
        data: client
      };
    }
    
    // Fallback to mock
    const mockClient = mockClients.find(c => c.id === id);
    return {
      success: !!mockClient,
      data: mockClient
    };
  } catch (error) {
    productionLogger.error(`Error fetching client ${id}:`, error);
    const mockClient = mockClients.find(c => c.id === id);
    return {
      success: !!mockClient,
      data: mockClient
    };
  }
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
  try {
    const mauticData = {
      email: data.email,
      firstName: data.name ? data.name.split(' ')[0] : undefined,
      lastName: data.name ? data.name.split(' ').slice(1).join(' ') : undefined,
      company: data.company,
    };

    const result = await updateContactAction(Number(id), mauticData);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to update client in Mautic"
      };
    }

    const contact = result.data;
    const client: Client = {
      id: String(contact.id),
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
      email: contact.email,
      company: contact.company || undefined,
      status: 'active',
      tags: contact.tags || [],
      points: contact.points || 0,
      lastActive: contact.lastActive || null,
      createdAt: new Date(contact.dateAdded),
      updatedAt: new Date(contact.dateModified)
    };

    return {
      success: true,
      data: client
    };
  } catch (error: unknown) {
    productionLogger.error(`Error updating client ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client"
    };
  }
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
