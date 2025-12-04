// src/hooks/useAuth.ts
import { useEffect, useState, useContext, createContext, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Define the shape of our application's user
export interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  role: 'user' | 'guardian';
  credits: number;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        // Use onSnapshot to keep user data in sync
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.email?.split('@')[0] || 'Utilisateur',
              role: userData.role || 'user',
              credits: userData.credits || 0,
            });
          } else {
            // User document doesn't exist, likely a new user, or error
            console.warn("Firestore user document not found for:", firebaseUser.uid);
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.email?.split('@')[0] || 'Utilisateur',
                role: 'user', // Default role if document not found
                credits: 0,
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching Firestore user data:", error);
          setLoading(false);
        });
        return () => unsubscribeFirestore(); // Unsubscribe from Firestore listener
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe from Auth listener
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};