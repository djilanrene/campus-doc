'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { storage, db } from '../../services/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import Layout from '../../components/Layout';
import DocumentUploadForm from '../../components/DocumentUploadForm';

interface UploadData {
  faculty: string;
  subject: string;
  year: number;
  type: string;
  file: File;
}

export default function Upload() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (data: UploadData) => {
    if (!user) {
      setError('Vous devez être connecté pour soumettre un document.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Uploader le fichier sur Firebase Storage
      const storagePath = `documents/${user.uid}/${data.file.name}_${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, data.file);
      
      // 2. Créer l'entrée dans Firestore
      await addDoc(collection(db, 'documents'), {
        title: `${data.subject} - ${data.type} ${data.year}`,
        faculty: data.faculty,
        subject: data.subject,
        year: data.year,
        type: data.type,
        uploaderId: user.uid,
        uploaderName: user.email, // Utiliser l'email comme nom par défaut
        status: 'pending', // Le document est en attente de modération
        createdAt: serverTimestamp(),
        storagePath: uploadResult.ref.fullPath,
        creditsCost: 1, // Coût par défaut pour un téléchargement
      });

      // 3. Rediriger l'utilisateur
      router.push('/dashboard');

    } catch (e) {
      console.error(e);
      setError('Une erreur est survenue lors de la soumission du document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Soumettre un document</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}
        {!user && <p className="text-center text-yellow-600">Veuillez vous connecter pour pouvoir soumettre un document.</p>}
        <DocumentUploadForm onSubmit={handleUpload} loading={loading} />
      </div>
    </Layout>
  );
}
