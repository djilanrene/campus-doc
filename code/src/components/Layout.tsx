'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import Notification from './Notification'; // Importer le nouveau composant

// 1. Définir le type pour le contexte de notification
type NotificationContextType = {
  showNotification: (message: string, type: 'success' | 'error') => void;
};

// 2. Créer le contexte avec une valeur par défaut
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 3. Créer un hook pour utiliser le contexte
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // TODO: Remplacer ce mock par une lecture du rôle depuis Firestore
  const role = user?.email === 'admin@campus.doc' ? 'moderator' : 'student';

  const handleLogout = async () => {
    await signOut(auth);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-md sticky top-0 z-10">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Campus Doc
            </Link>
            <div className="flex items-center gap-6 text-gray-600">
              {user && <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>}
              {user && <Link href="/upload" className="hover:text-blue-600">Contribuer</Link>}
              {user && role === 'moderator' && (
                <Link href="/moderation" className="hover:text-blue-600">Modération</Link>
              )}
              {!user && !loading && <Link href="/connexion" className="hover:text-blue-600">Connexion</Link>}
              {user && (
                <button
                  className="text-red-500 hover:text-red-700 font-semibold"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              )}
            </div>
          </nav>
        </header>

        <main className="flex-1 container mx-auto px-6 py-8">
          {children}
        </main>
        
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </NotificationContext.Provider>
  );
}
