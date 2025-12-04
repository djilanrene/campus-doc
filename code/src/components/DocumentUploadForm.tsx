import { useState } from 'react';

interface DocumentUploadFormProps {
  onSubmit: (data: {
    faculty: string;
    subject: string;
    year: number;
    type: string;
    file: File;
  }) => void;
  loading?: boolean;
}

export default function DocumentUploadForm({
  onSubmit,
  loading,
}: DocumentUploadFormProps) {
  const [faculty, setFaculty] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('Partiel');
  const [file, setFile] = useState<File | null>(null);

  return (
    <form
      className="flex flex-col gap-4 w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        if (!file) return;
        onSubmit({ faculty, subject, year, type, file });
      }}
    >
      <input
        type="text"
        placeholder="Filière"
        className="border rounded px-3 py-2"
        value={faculty}
        onChange={(e) => setFaculty(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Matière"
        className="border rounded px-3 py-2"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Année"
        className="border rounded px-3 py-2"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        required
      />
      <select
        className="border rounded px-3 py-2"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="Partiel">Partiel</option>
        <option value="Final">Final</option>
        <option value="Rattrapage">Rattrapage</option>
        <option value="TD">TD</option>
        <option value="Autre">Autre</option>
      </select>
      <input
        type="file"
        accept="application/pdf"
        className="border rounded px-3 py-2"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded px-4 py-2 font-semibold disabled:opacity-50"
        disabled={loading}
      >
        Soumettre
      </button>
    </form>
  );
}
