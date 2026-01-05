import { NextRequest } from 'next/server';
import { StorageOption } from '../types';

// Local mock billing info type for this module only
interface MockBillingInfo {
  currentPlan: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
    brand?: string;
    lastFour?: string;
    expiry?: string;
  };
  billingHistory: Array<{
    id: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
  }>;
  usage: {
    emailsSent: number;
    emailsLimit: number;
    storageUsed: number;
    storageLimit: number;
  };
  // Additional properties for UI compatibility
  planDetails?: {
    name: string;
    price: number;
    isMonthly: boolean;
    maxEmailAccounts: number;
    maxCampaigns: number;
  };
  emailAccountsUsed?: number;
  campaignsUsed?: number;
  message?: string;
}

const mockBillingInfo: MockBillingInfo = {
  currentPlan: 'Professional',
  billingCycle: 'monthly',
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    brand: 'Visa',
    lastFour: '4242',
    expiry: '12/25'
  },
  billingHistory: [
    {
      id: '1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: '2',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    }
  ],
  usage: {
    emailsSent: 2500,
    emailsLimit: 10000,
    storageUsed: 1.2,
    storageLimit: 5
  },
  planDetails: {
    name: 'Professional',
    price: 49.99,
    isMonthly: true,
    maxEmailAccounts: 10,
    maxCampaigns: 50
  },
  emailAccountsUsed: 5,
  campaignsUsed: 12
};

const storageOptions: StorageOption[] = [
  {
    id: '1',
    name: 'Extra 5GB',
    size: 5,
    gb: 5,
    price: 9.99,
    description: 'Additional 5GB storage for templates and assets'
  },
  {
    id: '2',
    name: 'Extra 10GB',
    size: 10,
    gb: 10,
    price: 17.99,
    description: 'Additional 10GB storage for templates and assets'
  }
];

export async function getBillingInfo(_req?: NextRequest) {
  // Shape aligned with legacy BillingData expected by settings components
  return {
    success: true,
    data: {
      renewalDate: mockBillingInfo.nextBillingDate.toISOString(),
      emailAccountsUsed: mockBillingInfo.emailAccountsUsed ?? 0,
      campaignsUsed: mockBillingInfo.campaignsUsed ?? 0,
      emailsPerMonthUsed: mockBillingInfo.usage.emailsSent,
      planDetails: {
        id: 'professional',
        name: mockBillingInfo.planDetails?.name ?? mockBillingInfo.currentPlan,
        isMonthly: mockBillingInfo.planDetails?.isMonthly ?? (mockBillingInfo.billingCycle === 'monthly'),
        price: mockBillingInfo.planDetails?.price ?? 0,
        description: 'Professional plan',
        maxEmailAccounts: mockBillingInfo.planDetails?.maxEmailAccounts ?? 0,
        maxCampaigns: mockBillingInfo.planDetails?.maxCampaigns ?? 0,
        maxEmailsPerMonth: mockBillingInfo.usage.emailsLimit,
      },
      paymentMethod: {
        lastFour: mockBillingInfo.paymentMethod.lastFour ?? mockBillingInfo.paymentMethod.last4,
        expiry: mockBillingInfo.paymentMethod.expiry ?? `${mockBillingInfo.paymentMethod.expiryMonth}/${mockBillingInfo.paymentMethod.expiryYear}`,
        brand: mockBillingInfo.paymentMethod.brand ?? 'Visa',
      },
      billingHistory: mockBillingInfo.billingHistory.map((item) => ({
        date: item.date.toISOString(),
        description: item.description,
        amount: `$${item.amount.toFixed(2)}`,
        method: mockBillingInfo.paymentMethod.type,
      })),
    },
  };
}

export async function updatePaymentMethod(_paymentData: unknown, _req?: NextRequest) {
  return {
    success: true,
    message: 'Payment method updated successfully'
  };
}

export async function changeBillingPlan(_planId: string, _req?: NextRequest) {
  return {
    success: true,
    message: 'Billing plan updated successfully'
  };
}

export async function getStorageOptions(_req?: NextRequest) {
  return {
    success: true,
    data: storageOptions
  };
}

export async function addStorage(_optionId: string, _req?: NextRequest) {
  return {
    success: true,
    message: 'Storage added successfully',
    data: {
      monthlyCost: 9.99
    }
  };
}

export async function getBillingDataForSettings(req?: NextRequest) {
  return getBillingInfo(req);
}

export async function updateBillingInfo(
  _params: { data: unknown; req?: NextRequest }
): Promise<{ success: boolean; message?: string }> {
  // Mock implementation
  return {
    success: true,
    message: 'Billing information updated successfully'
  };
}

export async function getUsageWithCalculations(_req?: NextRequest) {
  // Mock implementation for usage calculations
  return {
    success: true,
    data: {
      emailsSent: 2500,
      emailsLimit: 10000,
      storageUsed: 1.2,
      storageLimit: 5,
      campaignsUsed: 12,
      campaignsLimit: 50,
      emailAccountsUsed: 5,
      maxEmailAccounts: 10
    }
  };
}
