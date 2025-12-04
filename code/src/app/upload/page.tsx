'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { storage, db } from '../../services/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Upload as UploadIcon } from '../../components/Icons'; // Alias to avoid conflict
import { useToast } from '../../context/ToastContext'; // Import useToast


export default function Upload() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast(); // Use global showToast

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', faculty: 'Économie', subject: '', year: '2024', type: 'Partiel', file: null as File | null });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Vous devez être connecté pour soumettre un document.', 'error');
      return;
    }
    if (!form.file) {
      showToast("Veuillez sélectionner un fichier PDF.", 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Uploader le fichier sur Firebase Storage
      const storagePath = `documents/${user.uid}/${form.file.name}_${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, form.file);

      // 2. Créer l'entrée dans Firestore
      await addDoc(collection(db, 'documents'), {
        title: form.title, // Use title from form
        faculty: form.faculty,
        subject: form.subject,
        year: parseInt(form.year),
        type: form.type,
        uploaderId: user.uid,
        uploaderName: user.email, // Using email as name for now
        status: 'pending', // Document is pending moderation
        createdAt: serverTimestamp(),
        storagePath: uploadResult.ref.fullPath,
        creditsCost: 1, // Default cost for download
      });

      showToast("Document soumis ! En attente de validation.", 'success');
      router.push('/dashboard'); // Redirect to dashboard

    } catch (e: any) {
      console.error(e);
      setError('Une erreur est survenue lors de la soumission du document.');
      showToast('Erreur lors de la soumission du document.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Contribuer un document</h2>
        <p className="text-slate-500 mb-6 text-sm">Gagnez 5 crédits lorsque votre document est approuvé. Format PDF uniquement.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
        {!user && <p className="text-center text-yellow-600">Veuillez vous connecter pour pouvoir soumettre un document.</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filière</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" value={form.faculty} onChange={e => setForm({...form, faculty: e.target.value})}>
                <option value="Économie">Économie</option>
                <option value="Gestion">Gestion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="Partiel">Partiel</option>
                <option value="Final">Examen Final</option>
                <option value="Rattrapage">Rattrapage</option>
                <option value="TD">TD / Corrigé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Matière (ex: Microéconomie)</label>
            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                {[2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom du fichier (Titre)</label>
              <input type="text" required placeholder="Ex: Partiel Micro 2023" className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
            <input type="file" accept=".pdf" required className="hidden" id="file-upload" onChange={e => setForm({...form, file: e.target.files ? e.target.files[0] : null})} />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadIcon />
              <span className="mt-2 text-sm text-slate-600 font-medium">{form.file ? form.file.name : "Cliquez pour déposer votre PDF"}</span>
              <span className="text-xs text-slate-400 mt-1">PDF uniquement, max 5Mo</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">
            {loading ? 'Soumission...' : 'Soumettre pour validation'}
          </button>
        </form>
      </div>
    </div>
  );
}
