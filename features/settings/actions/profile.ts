'use server';

import { NextRequest } from 'next/server';
import { FormHandlerParams, FormHandlerResult } from '@/types';
import { ProfileFormValues } from '@/types';
import { UserRole } from '@/types';
import { BaseUser } from "@/shared/types";

// Extend BaseUser for profile-specific data
export interface AuthUser extends BaseUser {
  name?: string;
  displayName?: string;
  picture?: string;
  photoURL?: string;
  role?: string;
  claims?: {
    role: string;
    permissions: string[];
    tenantId: string;
  };
  preferences?: {
    timezone: string;
    language: string;
  };
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: string;
  companyId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileError {
  field: string;
  message: string;
  code: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  data?: AuthUser;
  errors?: ProfileError[];
}

export async function getUserProfile(_req?: NextRequest) {
  // Mock implementation - would get user from session/database
  const mockProfile: UserProfile = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    bio: 'Marketing professional with 5+ years experience',
    avatar: '/img/avatar-placeholder.png',
    role: 'admin',
    companyId: 'company-1',
    tenantId: 'tenant-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  return {
    success: true,
    data: mockProfile
  };
}

export async function updateUserProfile(
  params: FormHandlerParams<Partial<UserProfile>>
): Promise<FormHandlerResult<UserProfile>> {
  const { data, req: _req } = params;

  // Mock implementation - would update user profile in database
  return {
    success: true,
    data: { ...data, updatedAt: new Date() } as UserProfile,
    message: 'Profile updated successfully'
  };
}

export async function uploadAvatar(_file: File, _req?: NextRequest) {
  // Mock implementation - would upload file and return URL
  return {
    success: true,
    data: { avatarUrl: '/img/avatar-placeholder.png' },
    message: 'Avatar uploaded successfully'
  };
}

export async function updateProfile(data: ProfileFormValues, _req?: NextRequest): Promise<ProfileUpdateResult> {
  // Mock implementation - would validate and update profile
  const errors: ProfileError[] = [];

  if (!data.firstName) {
    errors.push({
      field: 'firstName',
      message: 'First name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!data.lastName) {
    errors.push({
      field: 'lastName',
      message: 'Last name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!data.email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT'
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }

  // Mock updated profile - in real implementation this would come from NileDB
  const updatedProfile: AuthUser = {
    id: 'mock-user-id',
    email: data.email,
    name: `${data.firstName} ${data.lastName}`,
    displayName: `${data.firstName} ${data.lastName}`,
    picture: data.avatarUrl,
    photoURL: data.avatarUrl,
    role: UserRole.USER,
    claims: {
      role: UserRole.USER,
      permissions: [],
      tenantId: 'mock-tenant-id',
    },
    preferences: {
      timezone: data.timezone || 'UTC',
      language: data.language || 'en',
    },
  };

  return {
    success: true,
    data: updatedProfile
  };
}
