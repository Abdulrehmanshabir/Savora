import 'server-only';
import * as admin from 'firebase-admin';

type AdminInstances = {
  adminDb: FirebaseFirestore.Firestore;
  adminAuth: admin.auth.Auth;
  adminStorage: admin.storage.Storage;
};

// Singleton promise — initializes once, reused on every call
let instancesPromise: Promise<AdminInstances> | null = null;

async function initializeAdmin(): Promise<AdminInstances> {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : undefined;

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
      console.error('❌ Firebase Admin env variables missing! Check Vercel environment settings.');
    } else {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey,
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
      }
    }
  }

  return {
    adminDb: admin.firestore(),
    adminAuth: admin.auth(),
    adminStorage: admin.storage(),
  };
}

/**
 * Returns initialized Firebase Admin instances.
 * Always await this before using adminDb / adminAuth / adminStorage.
 */
export async function getAdminServices(): Promise<AdminInstances> {
  if (!instancesPromise) {
    instancesPromise = initializeAdmin();
  }
  return instancesPromise;
}
