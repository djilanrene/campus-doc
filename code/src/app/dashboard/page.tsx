'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

import Layout from '../../components/Layout';
import CreditDisplay from '../../components/CreditDisplay';
import SearchFilters from '../../components/SearchFilters';
import DocumentList from '../../components/DocumentList';

// Type pour les documents, partagé avec DocumentList
interface Document {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  storagePath: string; // Champ crucial pour le téléchargement
  creditsCost: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null); // Pour suivre l'état de téléchargement par ID

  const [filters, setFilters] = useState({ faculty: '', subject: '', year: '' });

  // Effet pour récupérer le solde de crédits
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) setCredits(doc.data().credits);
    });
    return () => unsubscribe();
  }, [user]);

  // Effet pour récupérer les documents
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
      console.error(err);
    });
    return () => unsubscribe();
  }, []);

  const handleDownload = async (document: Document) => {
    if (!user) return alert('Veuillez vous connecter.');
    if (credits < document.creditsCost) return alert('Crédits insuffisants.');
    
    setDownloading(document.id);
    try {
      // Transaction pour déduire les crédits
      const userDocRef = doc(db, 'users', user.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("L'utilisateur n'existe pas.");
        
        const currentCredits = userDoc.data().credits;
        if (currentCredits < document.creditsCost) throw new Error('Crédits insuffisants.');
        
        const newCredits = currentCredits - document.creditsCost;
        transaction.update(userDocRef, { credits: newCredits });
      });

      // Obtenir l'URL de téléchargement
      const fileRef = ref(storage, document.storagePath);
      const url = await getDownloadURL(fileRef);

      // Ouvrir l'URL pour lancer le téléchargement
      window.open(url, '_blank');

    } catch (error: any) {
      console.error("Erreur de téléchargement: ", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const filteredDocs = documents.filter(doc =>
      (filters.faculty === '' || doc.faculty.toLowerCase().includes(filters.faculty.toLowerCase())) &&
      (filters.subject === '' || doc.subject.toLowerCase().includes(filters.subject.toLowerCase())) &&
      (filters.year === '' || doc.year.toString().includes(filters.year))
  );

  if (!user) {
    return <Layout><p className="text-center">Chargement des informations utilisateur...</p></Layout>;
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
