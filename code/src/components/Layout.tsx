import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  // TODO: remplacer ce mock par le vrai rôle Firestore
  const role = user?.email === 'guardian@campus.tg' ? 'guardian' : 'user';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-zinc-900 shadow">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Campus Doc
        </Link>
        <div className="flex gap-4">
          {user && <Link href="/dashboard">Dashboard</Link>}
          {user && <Link href="/upload">Contribuer</Link>}
          {user && role === 'guardian' && (
            <Link href="/moderation">Modération</Link>
          )}
          {!user && !loading && <Link href="/connexion">Connexion</Link>}
          {user && (
            <button
              className="text-red-600"
              onClick={() => {
                /* TODO: déconnexion */
              }}
            >
              Déconnexion
            </button>
          )}
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {children}
      </main>
    </div>
  );
}
