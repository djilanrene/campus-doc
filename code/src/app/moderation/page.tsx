'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db, storage } from '../../services/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { Shield } from '../../components/Icons'; // Import Shield icon
import { useToast } from '../../context/ToastContext'; // Import useToast


interface Document {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  uploader: string;
  uploaderId: string;
  storagePath: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function Moderation() {
  const { user } = useAuth();
  const { showToast } = useToast(); // Use global showToast

  const [role, setRole] = useState<'user' | 'guardian' | null>(null); // Use 'guardian' as in prototype
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // 1. Vérifier le rôle de l'utilisateur
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };

    const fetchUserRole = async () => {
      // Role should ideally come from useAuth now, but fetching directly from Firestore for robustness
      // and to ensure the most up-to-date role.
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().role === 'guardian') { // Check for 'guardian' role
        setRole('guardian');
      } else {
        setRole('user');
      }
      setLoading(false);
    };
    fetchUserRole();
  }, [user]);

  // 2. Récupérer les documents en attente
  useEffect(() => {
    if (role !== 'guardian') { // Only fetch if user is a guardian
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'documents'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Document[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document));
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      setError('Erreur lors de la récupération des documents.');
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]); // Trigger when role is confirmed

  const handleModerate = async (docId: string, decision: 'approve' | 'reject') => {
    try {
      if (decision === 'approve') {
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, 'documents', docId);
          transaction.update(docRef, { status: 'approved' });

          // Find the uploader and give them credits
          const documentToApprove = documents.find(d => d.id === docId);
          if (documentToApprove && documentToApprove.uploaderId) {
            const uploaderRef = doc(db, 'users', documentToApprove.uploaderId);
            const uploaderDoc = await transaction.get(uploaderRef);
            if (uploaderDoc.exists()) {
              const currentCredits = uploaderDoc.data().credits || 0;
              transaction.update(uploaderRef, { credits: currentCredits + 5 });
            }
          }
        });
        showToast("Document approuvé. Crédits envoyés à l'auteur.");
      } else { // reject
        if (!window.confirm(`Voulez-vous vraiment rejeter et supprimer ce document ?`)) return;

        const documentToReject = documents.find(d => d.id === docId);
        if (documentToReject) {
          const docRef = doc(db, 'documents', docId);
          await deleteDoc(docRef);

          const fileRef = ref(storage, documentToReject.storagePath);
          await deleteObject(fileRef);
          showToast("Document rejeté.", 'error');
        }
      }
    } catch (err) {
      console.error(`Erreur lors de la modération (${decision}): `, err);
      showToast(`Une erreur est survenue lors de la modération: ${err}`, 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (role !== 'guardian') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Accès Refusé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Shield /> Zone de Modération
      </h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}

      {documents.length === 0 ? (
        <div className="bg-green-50 text-green-700 p-8 rounded-xl text-center border border-green-100">
          <h3 className="font-bold text-lg">Tout est propre !</h3>
          <p>Aucun document en attente de validation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">{doc.faculty}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold uppercase text-slate-500">{doc.year}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900">{doc.title}</h3>
                <p className="text-sm text-slate-600">Sujet : {doc.subject} | Type : {doc.type}</p>
                <p className="text-xs text-slate-400 mt-1">Soumis par : {doc.uploader || doc.uploaderId}</p>
                {/* PDF preview button - for now, just a placeholder */}
                <button className="mt-3 text-brand-600 text-sm hover:underline flex items-center gap-1">
                  {/* <Icons.Download /> Replace with actual PDF viewer later */} Prévisualiser le PDF
                </button>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={() => handleModerate(doc.id, 'reject')} className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">Rejeter</button>
                <button onClick={() => handleModerate(doc.id, 'approve')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm transition-colors">Approuver (+5 crédits)</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
