import { useState } from 'react';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

export default function AuthForm({ type, onSubmit, loading }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <form
      className="flex flex-col gap-4 w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (type === 'register' && password !== confirm) return;
        onSubmit(email, password);
      }}
    >
      <input
        type="email"
        placeholder="Email"
        className="border rounded px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="border rounded px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {type === 'register' && (
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          className="border rounded px-3 py-2"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white rounded px-4 py-2 font-semibold disabled:opacity-50"
        disabled={loading}
      >
        {type === 'login' ? 'Se connecter' : "S'inscrire"}
      </button>
    </form>
  );
}
