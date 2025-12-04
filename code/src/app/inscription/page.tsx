'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Layout from '../../components/Layout';
import AuthForm from '../../components/AuthForm';
import { auth, db } from '../../services/firebase';

export default function Inscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Création du profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        role: 'student', // Rôle par défaut
        credits: 1, // Crédit de bienvenue
        createdAt: new Date(),
      });
      router.push('/dashboard'); // Redirection vers le tableau de bord
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée.');
      } else if (e.code === 'auth/weak-password') {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
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
        <h2 className="text-2xl font-bold mb-4 text-center">Créer un compte</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}
        <AuthForm type="register" onSubmit={handleRegister} loading={loading} />
      </div>
    </Layout>
  );
}
