'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Layout from '../../components/Layout';
import AuthForm from '../../components/AuthForm';
import { auth } from '../../services/firebase';

export default function Connexion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirection vers le tableau de bord
    } catch (e: any) {
      // Simplifier les messages d'erreur pour l'utilisateur
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}
        <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
      </div>
    </Layout>
  );
}
