'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // ✅ Utilisation de Link pour la navigation
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // ✅ Import absolu conforme à l'architecture
import { useToast } from '@/context/ToastContext';

export default function ConnexionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      showToast("Connexion réussie ! Redirection...", 'success');
      router.push('/dashboard'); 
      router.refresh(); // ✅ Force le rafraîchissement pour mettre à jour les Server Components (Layout)
      
    } catch (error) {
      // ✅ Typage plus sûr de l'erreur
      const firebaseError = error as AuthError;
      
      console.error("Erreur connexion:", firebaseError.code); // Log pour le débug

      switch (firebaseError.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          showToast('Email ou mot de passe incorrect.', 'error');
          break;
        case 'auth/too-many-requests':
          showToast('Trop de tentatives. Veuillez réessayer plus tard.', 'error');
          break;
        default:
          showToast('Une erreur est survenue. Veuillez réessayer.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 fade-in bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Connexion</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              id="email"
              type="email" 
              required 
              disabled={loading} // ✅ Désactivé pendant le chargement
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input 
              id="password"
              type="password" 
              required 
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              // Petit spinner SVG simple pour le feedback visuel
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Se connecter'}
          </button>
        </form>

        {/* Zone de Démo - À retirer avant la mise en prod */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
          <p className="font-bold mb-1 uppercase tracking-wide">Comptes de test (Démo)</p>
          <div className="flex flex-col gap-1 font-mono">
            <p><span className="font-semibold">Étudiant:</span> etudiant@faseg.ul / password</p>
            <p><span className="font-semibold">Gardien:</span> admin@campusdoc.ul / admin</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-colors">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}