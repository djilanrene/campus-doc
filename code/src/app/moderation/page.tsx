'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db, storage } from '../../services/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

import Layout from '../../components/Layout';
import DocumentModerationList, { ModerationDocument } from '../../components/DocumentModerationList';

type UserRole = 'student' | 'moderator';

export default function Moderation() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [documents, setDocuments] = useState<ModerationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // 1. Vérifier le rôle de l'utilisateur
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };

    const fetchUserRole = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().role === 'moderator') {
        setRole('moderator');
      } else {
        setRole('student');
      }
    };
    fetchUserRole();
  }, [user]);
  
  // 2. Récupérer les documents en attente
  useEffect(() => {
    // Ne rien faire si l'utilisateur n'est pas modérateur
    if (role !== 'moderator') {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'documents'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: ModerationDocument[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ModerationDocument));
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      setError('Erreur lors de la récupération des documents.');
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]); // Se déclenche quand le rôle est confirmé

  const handleApprove = async (document: ModerationDocument) => {
    setApprovingId(document.id);
    try {
      const docRef = doc(db, 'documents', document.id);
      await updateDoc(docRef, { status: 'approved' });
      // La logique d'attribution des crédits sera gérée par une Firebase Function (tâche séparée)
    } catch (err) {
      console.error("Erreur d'approbation: ", err);
      alert("Une erreur est survenue lors de l'approbation.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (document: ModerationDocument) => {
    if (!window.confirm(`Voulez-vous vraiment rejeter et supprimer le document "${document.title}" ?`)) return;

    setRejectingId(document.id);
    try {
      // Supprimer le document de Firestore
      const docRef = doc(db, 'documents', document.id);
      await deleteDoc(docRef);

      // Supprimer le fichier de Firebase Storage
      const fileRef = ref(storage, document.storagePath);
      await deleteObject(fileRef);

    } catch (err) {
      console.error("Erreur de rejet: ", err);
      alert("Une erreur est survenue lors du rejet.");
    } finally {
      setRejectingId(null);
    }
  };
  
  if (loading) {
    return <Layout><p className="text-center">Chargement...</p></Layout>;
  }
  
  if (role !== 'moderator') {
    return (
      <Layout>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Accès Refusé</h2>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Modération des documents</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <DocumentModerationList
          documents={documents}
          onApprove={handleApprove}
          onReject={handleReject}
          approvingId={approvingId}
          rejectingId={rejectingId}
        />
      </div>
    </Layout>
  );
}
