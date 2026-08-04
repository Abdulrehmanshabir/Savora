'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/firebase/client';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Cookies from 'js-cookie';

interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let userData: UserData;

        if (userSnap.exists()) {
          userData = userSnap.data() as UserData;
        } else {
          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
            role: 'customer',
          };
          await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
          });
        }

        setUser(userData);
        // Set a cookie for simple middleware auth state
        const token = await firebaseUser.getIdToken();
        Cookies.set('session', token, { expires: 1 });
      } else {
        setUser(null);
        Cookies.remove('session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      const token = await result.user.getIdToken();
      Cookies.set('session', token, { expires: 1 });
    }
  };

  const signOut = async () => {
    Cookies.remove('session');
    await firebaseSignOut(auth);
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUser(userSnap.data() as UserData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
