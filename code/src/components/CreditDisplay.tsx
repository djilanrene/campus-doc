import React from 'react';

interface CreditDisplayProps {
  credits: number;
}

export default function CreditDisplay({ credits }: CreditDisplayProps) {
  return (
    <div className="bg-green-100 text-green-800 px-4 py-2 rounded font-semibold mb-4">
      Crédits : {credits}
    </div>
  );
}
