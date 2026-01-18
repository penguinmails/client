"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { profileFormSchema, ProfileFormValues } from '@/features/settings/types/user';
import { ProfileError } from '@features/settings/actions/profile';
import { updateFullProfile, getProfile } from '@/features/settings/actions';
import { productionLogger, developmentLogger } from '@/lib/logger';

// Extended ProfileError for UI-specific error handling
export interface UIProfileError extends ProfileError {
  type?: 'network' | 'validation' | 'server';
}

export function useProfileForm(initialData?: Partial<ProfileFormValues>) {
  const [loading, _setLoading] = useState(false);
  const [profileLoading, _setProfileLoading] = useState(false);
  const [settingsLoading, _setSettingsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [profileError, setProfileError] = useState<UIProfileError | null>(null);
  const [isRetryingProfile, setIsRetryingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  
  const { isOnline } = useOnlineStatus();
  const MAX_RETRIES = 3;
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      bio: initialData?.bio || '',
      avatar: initialData?.avatar || '',
      name: initialData?.name || '',
      timezone: initialData?.timezone || 'UTC',
      language: initialData?.language || 'en',
      sidebarView: initialData?.sidebarView || 'expanded',
      avatarUrl: initialData?.avatarUrl || ''
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitLoading(true);
    setIsPending(true);
    try {
      const result = await updateFullProfile(data);
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || 'Failed to update profile');
      }
      developmentLogger.debug('Profile updated:', result.data);
    } catch (error) {
      productionLogger.error('Error updating profile:', error);
      setProfileError({
        field: 'general',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'SERVER_ERROR',
        type: 'server'
      });
    } finally {
      setSubmitLoading(false);
      setIsPending(false);
    }
  };

  const retryFetchProfile = async () => {
    if (retryCount >= MAX_RETRIES) return;
    
    setIsRetryingProfile(true);
    setRetryCount(prev => prev + 1);
    
    try {
      const result = await getProfile();
      if (!result.success) {
        throw new Error('Failed to fetch profile');
      }
      // Ideally we would update form values here, but for now we just clear the error
      // form.reset(result.data); 
      setProfileError(null);
    } catch (error) {
      setProfileError({
        field: 'general',
        message: error instanceof Error ? error.message : 'Retry failed',
        code: 'NETWORK_ERROR',
        type: 'network'
      });
    } finally {
      setIsRetryingProfile(false);
    }
  };

  return {
    form,
    loading,
    profileLoading,
    settingsLoading,
    profileError,
    submitLoading,
    isRetryingProfile,
    retryCount,
    customAvatarUrl,
    setCustomAvatarUrl,
    isPending,
    isOnline,
    MAX_RETRIES,
    onSubmit: form.handleSubmit(onSubmit),
    retryFetchProfile
  };
}
