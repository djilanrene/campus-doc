'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react'; // Assure-toi d'avoir installé lucide-react

// Définition propre des données du formulaire
export interface UploadFormData {
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  file: File;
}

interface DocumentUploadFormProps {
  onSubmit: (data: UploadFormData) => void;
  loading?: boolean;
}

export default function DocumentUploadForm({ onSubmit, loading = false }: DocumentUploadFormProps) {
  // États du formulaire
  const [title, setTitle] = useState('');
  const [faculty, setFaculty] = useState('Économie');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('Partiel');
  const [file, setFile] = useState<File | null>(null);
  
  // État pour les erreurs de validation locales (ex: fichier trop lourd)
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion du fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validation
      if (selectedFile.type !== 'application/pdf') {
        setLocalError('Format invalide. Seuls les PDF sont acceptés.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5 Mo
        setLocalError('Fichier trop volumineux (Max 5Mo).');
        return;
      }

      setFile(selectedFile);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLocalError(null);
  };

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setLocalError("Veuillez sélectionner un fichier.");
      return;
    }
    
    onSubmit({
      title,
      faculty,
      subject,
      year,
      type,
      file
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100">
      
      {/* --- Ligne 1 : Filière & Type --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Filière</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
          >
            <option value="Économie">Économie</option>
            <option value="Gestion">Gestion</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Type de document</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Partiel">Partiel</option>
            <option value="Final">Examen Final</option>
            <option value="Rattrapage">Rattrapage</option>
            <option value="TD">TD / Corrigé</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      {/* --- Ligne 2 : Matière --- */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Matière</label>
        <input
          type="text"
          placeholder="Ex: Microéconomie, Statistiques..."
          className="border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      {/* --- Ligne 3 : Année & Titre --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Année universitaire</label>
          <input
            type="number"
            min="2000"
            max={new Date().getFullYear() + 1}
            className="border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Titre du fichier</label>
          <input
            type="text"
            placeholder="Ex: Partiel Micro 2023 Session 1"
            className="border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>

      {/* --- Zone d'Upload (Drag & Drop visuel) --- */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Fichier PDF</label>
        
        <div 
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors 
            ${localError ? 'border-red-300 bg-red-50' : 
              file ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:bg-slate-50'}`}
        >
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={loading}
          />
          
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {file ? (
              <>
                <FileText className="w-10 h-10 text-brand-600 mb-2" />
                <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-500 mb-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={removeFile}
                  className="pointer-events-auto z-10 flex items-center gap-1 text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" /> Changer
                </button>
              </>
            ) : (
              <>
                <UploadCloud className={`w-10 h-10 mb-2 ${localError ? 'text-red-400' : 'text-slate-400'}`} />
                <span className="text-sm text-slate-600 font-medium">Cliquez ou glissez votre PDF ici</span>
                <span className="text-xs text-slate-400 mt-1">PDF uniquement, max 5Mo</span>
              </>
            )}
          </div>
        </div>
        
        {localError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {localError}
          </p>
        )}
      </div>

      {/* --- Bouton Submit --- */}
      <button
        type="submit"
        disabled={loading || !file}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Envoi en cours...
          </>
        ) : 'Soumettre le document'}
      </button>
    </form>
  );
}