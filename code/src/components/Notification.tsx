'use client';

import { useEffect } from 'react';
import { Check, X } from './Icons'; // Import the icons

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // 3 seconds as in prototype
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = type === 'error' ? 'bg-red-500' : 'bg-green-600'; // Using green-600 as in prototype
  const Icon = type === 'success' ? Check : X; // Choose icon based on type

  return (
    <div className={`toast ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 fade-in`}>
      <Icon />
      <span>{message}</span>
    </div>
  );
}