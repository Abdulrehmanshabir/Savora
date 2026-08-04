import { db } from '@/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'review' | 'order' | 'reservation' | 'promo' | 'system';
  link?: string;
  metadata?: any;
}

export interface AdminNotificationPayload {
  title: string;
  message: string;
  type?: 'review' | 'order' | 'reservation' | 'user' | 'system';
  link?: string;
  metadata?: any;
}

/**
 * Send real-time notification to a specific customer
 */
export async function sendNotification({
  userId,
  title,
  message,
  type = 'system',
  link = '/dashboard',
  metadata = null,
}: NotificationPayload) {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications', userId, 'items'), {
      title,
      message,
      type,
      link,
      metadata,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
}

/**
 * Send real-time notification to Admin
 */
export async function sendAdminNotification({
  title,
  message,
  type = 'system',
  link = '/admin',
  metadata = null,
}: AdminNotificationPayload) {
  try {
    await addDoc(collection(db, 'admin_notifications'), {
      title,
      message,
      type,
      link,
      metadata,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
}
