/**
 * Leads Feature Mock Data
 * 
 * Mock data for leads feature testing and development
 */

// Simple mock provider for leads data
class SimpleMockProvider<T extends { id: string }> {
  constructor(private data: T[]) {}
  
  getData(): T[] {
    return this.data;
  }
  
  getById(id: string): T | undefined {
    return this.data.find((item) => item.id === id);
  }
}

// Lead Mock Data
export interface MockLead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  source: string;
  createdAt: Date;
}

const mockLeads: MockLead[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    status: 'new',
    source: 'website',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@techstart.com',
    company: 'TechStart Inc',
    status: 'contacted',
    source: 'referral',
    createdAt: new Date('2024-01-16')
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@innovate.io',
    company: 'Innovate Solutions',
    status: 'qualified',
    source: 'linkedin',
    createdAt: new Date('2024-01-17')
  }
];

// Export Mock Provider
export const mockLeadProvider = new SimpleMockProvider(mockLeads);

// Convenience functions
export const getMockLeads = () => mockLeadProvider.getData();
export const getNewLeads = () => mockLeadProvider.getData().filter(l => l.status === 'new');
