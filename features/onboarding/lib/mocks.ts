/**
 * Onboarding Feature Mock Data
 * 
 * Mock data for onboarding feature testing and development
 */

// Simple mock provider for onboarding data
class SimpleMockProvider<T extends { id: string }> {
  constructor(private data: T[]) {}
  
  getData(): T[] {
    return this.data;
  }
  
  getById(id: string): T | undefined {
    return this.data.find((item) => item.id === id);
  }
}

// Onboarding Mock Data
export interface MockOnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
  category: 'setup' | 'configuration' | 'verification';
}

const mockOnboardingSteps: MockOnboardingStep[] = [
  {
    id: '1',
    title: 'Connect Email Account',
    description: 'Connect your email account to start sending campaigns',
    completed: true,
    order: 1,
    category: 'setup'
  },
  {
    id: '2',
    title: 'Verify Domain',
    description: 'Verify your sending domain for better deliverability',
    completed: false,
    order: 2,
    category: 'verification'
  },
  {
    id: '3',
    title: 'Import Contacts',
    description: 'Import your contact list to start reaching out',
    completed: false,
    order: 3,
    category: 'setup'
  }
];

// Export Mock Provider
export const mockOnboardingProvider = new SimpleMockProvider(mockOnboardingSteps);

// Convenience functions
export const getMockOnboardingSteps = () => mockOnboardingProvider.getData();
export const getIncompleteOnboardingSteps = () => 
  mockOnboardingProvider.getData().filter(s => !s.completed);
