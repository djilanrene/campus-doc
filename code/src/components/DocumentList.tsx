import React from 'react';

// Assurez-vous que ce type est exporté ou partagé si utilisé ailleurs
interface Document {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  uploader?: string; // Rendu optionnel car non affiché
  status?: string; // Rendu optionnel car non affiché
  creditsCost: number;
}

interface DocumentListProps {
  documents: Document[];
  onDownload: (document: Document) => void; // Changé de (id: string) à (document: Document)
}

export default function DocumentList({
  documents,
  onDownload,
}: DocumentListProps) {
  if (documents.length === 0) {
    return <p className="text-center text-gray-500 mt-8">Aucun document ne correspond à vos critères.</p>
  }

  return (
    <div className="w-full mt-6 overflow-x-auto">
      <table className="min-w-full border rounded shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Titre</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Matière</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Année</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Type</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">Coût</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="p-3 text-sm text-gray-800">{doc.title}</td>
              <td className="p-3 text-sm text-gray-500">{doc.subject}</td>
              <td className="p-3 text-sm text-gray-500">{doc.year}</td>
              <td className="p-3 text-sm text-gray-500">{doc.type}</td>
              <td className="p-3 text-center text-sm font-bold text-blue-600">{doc.creditsCost}</td>
              <td className="p-3 text-center">
                <button
                  className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium transition hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => onDownload(doc)} // Passe l'objet document entier
                >
                  Télécharger
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
