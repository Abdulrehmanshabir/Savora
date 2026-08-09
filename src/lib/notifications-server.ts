import { getAdminServices } from '@/firebase/admin';

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

export async function sendNotificationServer({
  userId,
  title,
  message,
  type = 'system',
  link = '/dashboard',
  metadata = null,
}: NotificationPayload) {
  if (!userId) return;
  try {
    const { adminDb } = await getAdminServices();
    await adminDb.collection('notifications').doc(userId).collection('items').add({
      title,
      message,
      type,
      link,
      metadata,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user notification (Server):', error);
  }
}

export async function sendAdminNotificationServer({
  title,
  message,
  type = 'system',
  link = '/admin',
  metadata = null,
}: AdminNotificationPayload) {
  try {
    const { adminDb } = await getAdminServices();
    await adminDb.collection('admin_notifications').add({
      title,
      message,
      type,
      link,
      metadata,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating admin notification (Server):', error);
  }
}
