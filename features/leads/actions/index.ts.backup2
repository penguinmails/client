'use server';

import { NextRequest } from 'next/server';

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
