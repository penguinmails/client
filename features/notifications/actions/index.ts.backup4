'use server';

import { NextRequest } from 'next/server';
import { NotificationType, Notification } from '../types';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Campaign Completed',
    message: 'Your Q1 campaign has successfully completed',
    type: NotificationType.INFO,
    isRead: false,
    createdAt: new Date(),
    time: new Date()
  },
  {
    id: '2',
    title: 'Domain Verification Required',
    message: 'Please verify your domain to improve deliverability.',
    type: NotificationType.WARNING,
    isRead: false,
    createdAt: new Date(Date.now() - 7200000),
    time: new Date(Date.now() - 3600000)
  },
  {
    id: '3',
    title: 'New Lead Added',
    message: 'A new lead has been added to your Enterprise Prospects list.',
    type: NotificationType.INFO,
    isRead: true,
    createdAt: new Date(Date.now() - 86400000),
    time: new Date(Date.now() - 7200000)
  }
];

export async function getNotifications(_req?: NextRequest) {
  return {
    success: true,
    data: {
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length
    }
  };
}

export async function markNotificationAsRead(_id: string, _req?: NextRequest) {
  return {
    success: true,
    message: 'Notification marked as read'
  };
}

export async function markAllNotificationsAsRead(_req?: NextRequest) {
  return {
    success: true,
    message: 'All notifications marked as read'
  };
}
