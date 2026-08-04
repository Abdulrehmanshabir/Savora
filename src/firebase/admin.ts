import 'server-only';

// Use dynamic import() so Turbopack never statically bundles firebase-admin.
// This lets Node.js load jose (pure ESM) correctly at runtime.
// Static require() of jose fails because Turbopack's CJS runtime cannot require() ESM modules.

type AdminInstances = {
  adminDb: FirebaseFirestore.Firestore;
  adminAuth: import('firebase-admin/auth').Auth;
  adminStorage: import('firebase-admin/storage').Storage;
};

// Singleton promise — initializes once, reused on every call
let instancesPromise: Promise<AdminInstances> | null = null;

async function initializeAdmin(): Promise<AdminInstances> {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getAuth } = await import('firebase-admin/auth');
  const { getStorage } = await import('firebase-admin/storage');

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
