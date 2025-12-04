'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirection vers le tableau de bord
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setError('Identifiants incorrects.');
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
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Connexion</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg transition-colors">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500">
          <p className="font-semibold mb-1">DÉMO - Comptes de test :</p>
          <p>Étudiant : etudiant@faseg.ul / password</p>
          <p>Gardien : admin@campusdoc.ul / admin</p>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">
          Pas encore de compte ? <button onClick={() => router.push('/inscription')} className="text-brand-600 hover:underline font-medium">S'inscrire</button>
        </p>
      </div>
    </div>
  );
}