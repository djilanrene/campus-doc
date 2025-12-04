'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Download } from '../../components/Icons'; // Import Download icon
import { useToast } from '../../context/ToastContext'; // Import useToast


interface Document {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  uploader: string; // Added uploader as per prototype's mock data
  status: 'approved' | 'pending' | 'rejected'; // Added status
  creditsCost: number;
  storagePath: string; // Add storagePath
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast(); // Use global showToast

  const [credits, setCredits] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const [filters, setFilters] = useState({ faculty: '', subject: '', year: '' });

  useEffect(() => {
    if (!user) {
      // Handle unauthenticated state, maybe redirect to login
      setLoading(false);
      return;
    }

    // Credits are now managed by useAuth from Firestore snapshot, no need for separate listener here
    // However, if we need to display current credits immediately in Dashboard without waiting for AuthProvider sync,
    // we could keep a local state for `credits` and update it from `user.credits` provided by `useAuth`.
    // For simplicity, let's just rely on `user.credits` from `useAuth` if available.
    if (user && typeof user.credits === 'number') {
      setCredits(user.credits);
    }


    const q = query(collection(db, 'documents'), where('status', '==', 'approved'));
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const docs: Document[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      setPageError('Erreur lors du chargement des documents.');
      showToast('Erreur lors du chargement des documents.', 'error');
      setLoading(false);
    });

    return () => {
      unsubscribeDocs();
    }
  }, [user, showToast]); // Added showToast to dependency array

  const handleDownload = async (document: Document) => {
    if (!user) {
      showToast('Veuillez vous connecter pour télécharger.', 'error');
      return;
    }
    if (credits < document.creditsCost) { // Use local credits state or user.credits
      showToast('Crédits insuffisants pour télécharger ce document.', 'error');
      return;
    }

    setDownloading(document.id);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("L'utilisateur n'existe pas.");

        const currentCredits = userDoc.data().credits;
        if (currentCredits < document.creditsCost) throw new Error('Crédits insuffisants.');

        transaction.update(userDocRef, { credits: currentCredits - document.creditsCost });
      });

      const fileRef = ref(storage, document.storagePath);
      const url = await getDownloadURL(fileRef);
      window.open(url, '_blank');
      showToast('Le téléchargement va commencer.', 'success');

    } catch (error: any) {
      console.error("Erreur de téléchargement: ", error);
      showToast(error.message || 'Une erreur est survenue.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (doc.status !== 'approved') return false; // Ensure only approved docs are shown
    if (filters.faculty && doc.faculty !== filters.faculty) return false;
    if (filters.subject && !doc.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
    if (filters.year && doc.year.toString() !== filters.year) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (pageError) {
    return <div className="text-center py-8 text-red-500">{pageError}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
        <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Bibliothèque FASEG</h2>
            <p className="text-slate-500 mt-2">Recherchez parmi les documents approuvés. Coût téléchargement: 1 crédit.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filière</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.faculty} onChange={e => setFilters({...filters, faculty: e.target.value})}>
                    <option value="">Toutes les filières</option>
                    <option value="Économie">Économie</option>
                    <option value="Gestion">Gestion</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Matière</label>
                <input type="text" placeholder="Ex: Macro, Droit..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Année</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}>
                    <option value="">Toutes</option>
                    {[2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div className="text-right text-sm text-slate-400 pb-2">
                {filteredDocs.length} résultats trouvés
            </div>
        </div>

        {/* List Results */}
        <div className="grid grid-cols-1 gap-4">
            {filteredDocs.length > 0 ? (
                filteredDocs.map(doc => (
                    <div key={doc.id} className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex gap-2 mb-1">
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{doc.faculty}</span>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{doc.year}</span>
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">{doc.type}</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">{doc.title}</h3>
                            <p className="text-slate-500 text-sm">{doc.subject}</p>
                        </div>
                        <button
                            onClick={() => handleDownload(doc)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                            disabled={downloading === doc.id}
                        >
                            {downloading === doc.id ? 'Téléchargement...' : (
                              <>
                                <Download /> Télécharger
                              </>
                            )}
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">Aucun document ne correspond à vos critères.</p>
                    <button onClick={() => setFilters({ faculty: '', subject: '', year: '' })} className="text-brand-600 mt-2 text-sm font-medium hover:underline">Réinitialiser les filtres</button>
                </div>
            )}
        </div>
    </div>
  );
}
