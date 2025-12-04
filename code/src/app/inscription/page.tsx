'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export default function Inscription() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name: email.split('@')[0], // Extract name from email as in prototype
        role: 'user', // Default role
        credits: 3, // 3 credits as per prototype
        createdAt: new Date(),
      });
      router.push('/dashboard'); // Redirect to dashboard
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
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 fade-in">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Créer un compte</h2>
        <div className="bg-blue-50 text-brand-700 p-3 rounded-md text-sm mb-6 text-center">
          🎁 Offre de lancement : <strong>3 crédits offerts</strong> à l'inscription !
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email universitaire</label>
            <input type="email" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer Mot de passe</label>
            <input type="password" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg transition-colors">
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Déjà inscrit ? <button onClick={() => router.push('/connexion')} className="text-brand-600 hover:underline font-medium">Se connecter</button>
        </p>
      </div>
    </div>
  );
}