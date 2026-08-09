import 'server-only';

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import type { Auth } from 'firebase-admin/auth';
import type { Storage } from 'firebase-admin/storage';

type AdminInstances = {
  adminDb: FirebaseFirestore.Firestore;
  adminAuth: Auth;
  adminStorage: Storage;
};

// Singleton promise — initializes once, reused on every call
let instancesPromise: Promise<AdminInstances> | null = null;

async function initializeAdmin(): Promise<AdminInstances> {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : undefined;

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
      console.error('❌ Firebase Admin env variables missing! Check Vercel environment settings.');
    } else {
      try {
        initializeApp({
          credential: cert({
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
    adminDb: getFirestore(),
    adminAuth: getAuth(),
    adminStorage: getStorage(),
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
