'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // ✅ Navigation optimisée Next.js
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // ✅ serverTimestamp pour la date
import { auth, db } from '@/lib/firebase/config'; // ✅ Import absolu
import { useToast } from '@/context/ToastContext';
import { Gift, AlertCircle } from 'lucide-react'; // ✅ Icônes pour l'UI

export default function InscriptionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation pré-requête
    if (password !== confirm) {
      return showToast("Les mots de passe ne correspondent pas.", 'error');
    }
    if (password.length < 6) {
      return showToast("Le mot de passe doit faire au moins 6 caractères.", 'error');
    }

    setLoading(true);

    try {
      // 1. Création du compte Authentification
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Création du profil Utilisateur dans Firestore
      // On utilise l'UID de l'auth comme ID du document pour un lien 1:1 parfait
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email,
        name: email.split('@')[0], // Génération d'un pseudo par défaut
        role: 'user',
        credits: 3, // 🎉 Bonus de bienvenue
        createdAt: serverTimestamp(), // Date serveur fiable
      });

      showToast("Compte créé avec succès ! Bienvenue.", 'success');
      
      // Pas besoin de signIn, createUser connecte automatiquement
      router.push('/dashboard'); 
      router.refresh();

    } catch (error) {
      const firebaseError = error as AuthError;
      console.error("Erreur inscription:", firebaseError.code);

      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          showToast('Cette adresse email est déjà utilisée.', 'error');
          break;
        case 'auth/weak-password':
          showToast('Le mot de passe est trop faible.', 'error');
          break;
        case 'auth/invalid-email':
          showToast("Format d'email invalide.", 'error');
          break;
        default:
          showToast('Une erreur est survenue lors de l\'inscription.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 fade-in bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Créer un compte</h2>
        
        {/* Banner Offre */}
        <div className="bg-blue-50 text-brand-700 p-4 rounded-lg text-sm mb-6 flex items-start gap-3 border border-blue-100 shadow-sm">
          <Gift className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-600" />
          <span>
             Offre de lancement FASEG :<br/>
             <strong>3 crédits offerts</strong> immédiatement à l'inscription !
          </span>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email universitaire</label>
            <input 
              id="email"
              type="email" 
              required 
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-100 transition-all" 
              placeholder="etudiant@etud.univ-lome.tg"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div>
            <label htmlFor="pass" className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input 
              id="pass"
              type="password" 
              required 
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-slate-100 transition-all" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1">Confirmer Mot de passe</label>
            <input 
              id="confirm"
              type="password" 
              required 
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none disabled:bg-slate-100 transition-all ${
                confirm && password !== confirm 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                  : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
              }`} 
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "S'inscrire gratuitement"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà inscrit ?{' '}
          <Link href="/connexion" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}