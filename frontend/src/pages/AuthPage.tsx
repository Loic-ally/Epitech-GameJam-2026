import React, { FormEvent, useState } from 'react';
import '../App.css';
import { AuthForm } from '../components/AuthForm';
import { AuthSession } from '../types/auth.type';

type Mode = 'login' | 'register';

export interface AuthPageProps {
  onAuthenticated: (session: AuthSession) => void;
}

const API_BASE = process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000`;

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      mode === 'login'
        ? { email, password }
        : { email, password, firstName: firstName.trim(), lastName: lastName.trim() };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Une erreur est survenue');
      }

      const data = (await res.json()) as AuthSession;
      onAuthenticated(data);
    } catch (err: any) {
      setError(err?.message || 'Impossible de se connecter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>{mode === 'login' ? 'Connexion' : 'Inscription'}</h1>

        <AuthForm
          mode={mode}
          email={email}
          password={password}
          firstName={firstName}
          lastName={lastName}
          isLoading={isLoading}
          onModeChange={setMode}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onChangeFirstName={setFirstName}
          onChangeLastName={setLastName}
          onSubmit={handleSubmit}
        />

        {error && <p className="status" style={{ color: '#ffb5b5' }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
