'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react'; // ✅ Icônes modernes

import { storage, db } from '@/lib/firebase/config'; // ✅ Import absolu
import { useAuthContext } from '@/context/AuthContext'; // ✅ Contexte global
import { useToast } from '@/context/ToastContext';

export default function UploadPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    faculty: 'Économie',
    subject: '',
    year: '2024',
    type: 'Partiel',
    file: null as File | null
  });

  // --- Actions ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation 1 : Type PDF
      if (selectedFile.type !== 'application/pdf') {
        showToast('Seuls les fichiers PDF sont acceptés.', 'error');
        return;
      }
      // Validation 2 : Taille (< 5Mo)
      if (selectedFile.size > 5 * 1024 * 1024) {
        showToast('Le fichier est trop lourd (Max 5Mo).', 'error');
        return;
      }

      setForm({ ...form, file: selectedFile });
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche l'ouverture du sélecteur
    setForm({ ...form, file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return showToast('Connexion requise.', 'error');
    if (!form.file) return showToast("Veuillez sélectionner un fichier PDF.", 'error');

    setLoading(true);

    try {
      // 1. Définition du chemin de stockage sécurisé
      // documents/{userId}/{timestamp}_{nom_nettoyé}
      const sanitizedFileName = form.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `documents/${user.uid}/${Date.now()}_${sanitizedFileName}`;
      
      const storageRef = ref(storage, storagePath);

      // 2. Upload sur Firebase Storage
      const uploadResult = await uploadBytes(storageRef, form.file);

      // 3. Création des métadonnées dans Firestore
      await addDoc(collection(db, 'documents'), {
        title: form.title,
        faculty: form.faculty,
        subject: form.subject,
        year: parseInt(form.year),
        type: form.type,
        
        uploaderId: user.uid,
        uploaderName: user.displayName || user.email?.split('@')[0] || 'Anonyme',
        
        status: 'pending', // En attente de modération
        creditsCost: 1,
        
        storagePath: uploadResult.ref.fullPath, // Chemin interne (plus sûr que l'URL publique directe)
        createdAt: serverTimestamp(),
      });

      showToast("Document envoyé ! +5 crédits après validation.", 'success');
      router.push('/dashboard'); 

    } catch (error: any) {
      console.error(error);
      showToast('Erreur lors de l\'envoi. Vérifiez votre connexion.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Contribuer un document</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Partagez vos ressources et aidez la communauté FASEG. 
          <span className="font-semibold text-brand-600 block mt-1">Gain : 5 crédits par document approuvé.</span>
        </p>

        {!user && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm border border-amber-100">
            <AlertCircle className="w-5 h-5" />
            Veuillez vous connecter pour soumettre un document.
          </div>
        )}

        <form onSubmit={handleSubmit} className={`space-y-6 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Ligne 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filière</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none" 
                value={form.faculty} 
                onChange={e => setForm({...form, faculty: e.target.value})}
              >
                <option value="Économie">Économie</option>
                <option value="Gestion">Gestion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de document</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none" 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value})}
              >
                <option value="Partiel">Partiel</option>
                <option value="Final">Examen Final</option>
                <option value="Rattrapage">Rattrapage</option>
                <option value="TD">TD / Corrigé</option>
              </select>
            </div>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Matière</label>
            <input 
              type="text" 
              required 
              placeholder="Ex: Microéconomie, Statistiques..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none" 
              value={form.subject} 
              onChange={e => setForm({...form, subject: e.target.value})} 
            />
          </div>

          {/* Ligne 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Année universitaire</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none" 
                value={form.year} 
                onChange={e => setForm({...form, year: e.target.value})}
              >
                {[2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre du fichier</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Partiel Micro 2023 Session 1" 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
              />
            </div>
          </div>

          {/* Zone d'Upload (Drag & Drop visuel) */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer relative group
              ${form.file ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}`}
          >
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange} 
            />
            
            <div className="flex flex-col items-center justify-center pointer-events-none">
              {form.file ? (
                <>
                  <FileText className="w-10 h-10 text-brand-600 mb-2" />
                  <p className="text-sm font-medium text-slate-900 truncate max-w-[250px]">{form.file.name}</p>
                  <p className="text-xs text-slate-500 mb-3">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  {/* Bouton Supprimer */}
                  <button 
                    type="button"
                    onClick={removeFile}
                    className="z-10 pointer-events-auto flex items-center gap-1 text-xs bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3 h-3" /> Changer de fichier
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2 group-hover:text-slate-500 transition-colors" />
                  <span className="mt-2 text-sm text-slate-600 font-medium">Cliquez pour déposer votre PDF</span>
                  <span className="text-xs text-slate-400 mt-1">PDF uniquement, max 5Mo</span>
                </>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Envoi en cours...
               </>
            ) : 'Soumettre pour validation'}
          </button>
        </form>
      </div>
    </div>
  );
}