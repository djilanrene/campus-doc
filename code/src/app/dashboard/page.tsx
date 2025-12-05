'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config'; // ✅ Correction du chemin import
import { useAuthContext } from '@/context/ToastContext'; // ✅ Supposant que tu utilises un Contexte
import { useToast } from '@/context/ToastContext';
import { Download, Search, FileText, AlertCircle } from 'lucide-react'; // ✅ Utilisation d'icônes standard

// ✅ Définition claire de l'interface
interface Document {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  uploader: string;
  status: 'approved' | 'pending' | 'rejected';
  creditsCost: number;
  storagePath: string;
}

export default function Dashboard() {
  // ✅ Utilisation du contexte Auth (plus robuste que useAuth local)
  const { user } = useAuthContext(); 
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  // État pour gérer quel document est en cours de téléchargement (spinner)
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [filters, setFilters] = useState({ faculty: '', subject: '', year: '' });

  // 1. Chargement des données
  useEffect(() => {
    // Requête sécurisée : seulement les documents approuvés
    const q = query(collection(db, 'documents'), where('status', '==', 'approved'));
    
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      console.error("Erreur Firestore:", err);
      setPageError('Impossible de charger les documents.');
      setLoading(false);
    });

    return () => unsubscribeDocs();
  }, []); // Pas de dépendance 'user' nécessaire pour charger la liste publique

  // 2. Gestion du Téléchargement (Transaction sécurisée)
  const handleDownload = async (document: Document) => {
    if (!user) {
      showToast('Veuillez vous connecter pour télécharger.', 'error');
      return;
    }

    // Vérification optimiste locale
    if ((user.credits || 0) < document.creditsCost) {
      showToast(`Solde insuffisant. Il vous faut ${document.creditsCost} crédit(s).`, 'error');
      return;
    }

    setDownloadingId(document.id);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Transaction Atomique : Lire -> Vérifier -> Écrire
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("Compte utilisateur introuvable.");

        const currentCredits = userDoc.data().credits || 0;
        if (currentCredits < document.creditsCost) {
          throw new Error('Crédits insuffisants (vérifié serveur).');
        }

        transaction.update(userDocRef, { credits: currentCredits - document.creditsCost });
      });

      // Si la transaction réussit, on récupère l'URL
      const fileRef = ref(storage, document.storagePath);
      const url = await getDownloadURL(fileRef);
      
      // Ouverture dans un nouvel onglet
      window.open(url, '_blank');
      showToast('Téléchargement lancé !', 'success');

    } catch (error: any) {
      console.error("Erreur de téléchargement: ", error);
      showToast(error.message || 'Une erreur est survenue.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // 3. Filtrage local
  const filteredDocs = documents.filter(doc => {
    if (filters.faculty && doc.faculty !== filters.faculty) return false;
    if (filters.subject && !doc.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
    if (filters.year && doc.year.toString() !== filters.year) return false;
    return true;
  });

  // --- RENDU ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400 font-medium">Chargement de la bibliothèque...</div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-red-500 gap-2">
        <AlertCircle className="w-5 h-5" /> {pageError}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
        <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bibliothèque FASEG</h2>
            <p className="text-slate-500 mt-2">
              Recherchez parmi les documents approuvés. 
              {user && (
                <span className="ml-2 bg-blue-50 text-brand-700 px-2 py-1 rounded text-sm font-semibold">
                  Solde: {user.credits} crédits
                </span>
              )}
            </p>
        </div>

        {/* --- Filtres --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filière</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                  value={filters.faculty} 
                  onChange={e => setFilters({...filters, faculty: e.target.value})}
                >
                    <option value="">Toutes les filières</option>
                    <option value="Économie">Économie</option>
                    <option value="Gestion">Gestion</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Matière</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Ex: Macro, Droit..." 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                    value={filters.subject} 
                    onChange={e => setFilters({...filters, subject: e.target.value})} 
                  />
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Année</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                  value={filters.year} 
                  onChange={e => setFilters({...filters, year: e.target.value})}
                >
                    <option value="">Toutes</option>
                    {[2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div className="text-right text-sm text-slate-400 pb-3 font-medium">
                {filteredDocs.length} résultats
            </div>
        </div>

        {/* --- Liste Résultats --- */}
        <div className="grid grid-cols-1 gap-4">
            {filteredDocs.length > 0 ? (
                filteredDocs.map(doc => (
                    <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                                <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{doc.faculty}</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">{doc.year}</span>
                                <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{doc.type}</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              {doc.title}
                            </h3>
                            <p className="text-slate-500 text-sm">{doc.subject}</p>
                        </div>
                        
                        <button
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingId === doc.id || (user?.credits || 0) < doc.creditsCost}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                              ${(user?.credits || 0) < doc.creditsCost 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }
                            `}
                        >
                            {downloadingId === doc.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                En cours...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                {(user?.credits || 0) < doc.creditsCost ? 'Solde insuffisant' : 'Télécharger'}
                              </>
                            )}
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-500">Aucun document ne correspond à vos critères.</p>
                    <button onClick={() => setFilters({ faculty: '', subject: '', year: '' })} className="text-brand-600 mt-2 text-sm font-medium hover:underline">
                      Réinitialiser les filtres
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}