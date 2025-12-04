import React from 'react';

// Le type doit inclure toutes les données nécessaires pour les actions
export interface ModerationDocument {
  id: string;
  title: string;
  faculty: string;
  subject: string;
  year: number;
  type: string;
  uploaderName: string; // Nom de l'uploader
  storagePath: string; // Chemin du fichier pour la suppression
}

interface DocumentModerationListProps {
  documents: ModerationDocument[];
  onApprove: (document: ModerationDocument) => void;
  onReject: (document: ModerationDocument) => void;
  approvingId?: string | null;
  rejectingId?: string | null;
}

export default function DocumentModerationList({
  documents,
  onApprove,
  onReject,
  approvingId,
  rejectingId,
}: DocumentModerationListProps) {
  if (documents.length === 0) {
    return <p className="text-center text-gray-500 mt-8">Aucun document en attente de modération.</p>;
  }

  return (
    <div className="w-full mt-6 overflow-x-auto">
      <table className="min-w-full border rounded shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Titre</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Matière</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Uploader</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => {
            const isApproving = approvingId === doc.id;
            const isRejecting = rejectingId === doc.id;
            return (
              <tr key={doc.id}>
                <td className="p-3 text-sm text-gray-800">{doc.title}</td>
                <td className="p-3 text-sm text-gray-500">{doc.subject}</td>
                <td className="p-3 text-sm text-gray-500">{doc.uploaderName}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    className="bg-green-600 text-white rounded px-4 py-2 text-sm font-medium transition hover:bg-green-700 disabled:opacity-50"
                    onClick={() => onApprove(doc)}
                    disabled={isApproving || isRejecting}
                  >
                    {isApproving ? '...' : 'Approuver'}
                  </button>
                  <button
                    className="bg-red-600 text-white rounded px-4 py-2 text-sm font-medium transition hover:bg-red-700 disabled:opacity-50"
                    onClick={() => onReject(doc)}
                    disabled={isApproving || isRejecting}
                  >
                    {isRejecting ? '...' : 'Rejeter'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
