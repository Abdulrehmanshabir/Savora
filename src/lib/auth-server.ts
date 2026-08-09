import { cookies } from 'next/headers';
import { getAdminServices } from '@/firebase/admin';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const { adminAuth, adminDb } = await getAdminServices();
    const decodedToken = await adminAuth.verifyIdToken(sessionToken);
    
    // Optional: Fetch user role from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData?.role || 'customer'
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
