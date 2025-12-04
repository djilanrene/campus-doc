import React from 'react';

interface SearchFiltersProps {
  faculty: string;
  subject: string;
  year: string;
  onChange: (filters: {
    faculty: string;
    subject: string;
    year: string;
  }) => void;
}

export default function SearchFilters({
  faculty,
  subject,
  year,
  onChange,
}: SearchFiltersProps) {
  return (
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        placeholder="Filière"
        className="border rounded px-3 py-2"
        value={faculty}
        onChange={(e) => onChange({ faculty: e.target.value, subject, year })}
      />
      <input
        type="text"
        placeholder="Matière"
        className="border rounded px-3 py-2"
        value={subject}
        onChange={(e) => onChange({ faculty, subject: e.target.value, year })}
      />
      <input
        type="text"
        placeholder="Année"
        className="border rounded px-3 py-2"
        value={year}
        onChange={(e) => onChange({ faculty, subject, year: e.target.value })}
      />
    </div>
  );
}
