'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

import Layout, { useNotification } from '../../components/Layout'; // Importer le hook
import CreditDisplay from '../../components/CreditDisplay';
import SearchFilters from '../../components/SearchFilters';
import DocumentList from '../../components/DocumentList';

interface Document {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  storagePath: string;
  creditsCost: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification(); // Utiliser le hook
  const [credits, setCredits] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const [filters, setFilters] = useState({ faculty: '', subject: '', year: '' });

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) setCredits(doc.data().credits);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'documents'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Document[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      setPageError('Erreur lors du chargement des documents.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDownload = async (document: Document) => {
    if (!user) {
      showNotification('Veuillez vous connecter pour télécharger.', 'error');
      return;
    }
    if (credits < document.creditsCost) {
      showNotification('Crédits insuffisants pour télécharger ce document.', 'error');
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
      showNotification('Le téléchargement va commencer.', 'success');

    } catch (error: any) {
      console.error("Erreur de téléchargement: ", error);
      showNotification(error.message || 'Une erreur est survenue.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const filteredDocs = documents.filter(doc =>
      (filters.faculty === '' || doc.faculty.toLowerCase().includes(filters.faculty.toLowerCase())) &&
      (filters.subject === '' || doc.subject.toLowerCase().includes(filters.subject.toLowerCase())) &&
      (filters.year === '' || doc.year.toString().includes(filters.year))
  );

  if (!user && loading) {
    return <Layout><p className="text-center">Chargement...</p></Layout>;
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Tableau de bord</h2>
          <CreditDisplay credits={credits} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SearchFilters {...filters} onChange={setFilters} />
          {loading ? (
            <p className="text-center mt-8">Chargement des documents...</p>
          ) : pageError ? (
            <p className="text-center text-red-500 mt-8">{pageError}</p>
          ) : (
            <DocumentList documents={filteredDocs} onDownload={handleDownload} />
          )}
        </div>
      </div>
    </Layout>
  );
}
