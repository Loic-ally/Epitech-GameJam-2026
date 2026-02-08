import React, { FormEvent, useState } from 'react';
import '../App.css';
import { AuthForm } from '../components/AuthForm';
import { AuthSession } from '../types/auth.type';
import { FloatingIslandScene } from '../components/FloatingIslandScene';
import { StartScreen } from '../components/StartScreen';
import { useIslandScene } from '../hooks/useIslandScene';

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
  const [showStart, setShowStart] = useState(true);
  const [isBlurred, setIsBlurred] = useState(true);

  const { isFormVisible, setFormVisible, launchGame } = useIslandScene();

  const handleStart = () => {
    setShowStart(false);
    setIsBlurred(false);
    
    // Trigger island transition after start screen fades
    setTimeout(() => {
      if ((window as any).__transitionToForm) {
        (window as any).__transitionToForm();
      }
    }, 500);
  };

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
      
      launchGame();
      
      setTimeout(() => {
        onAuthenticated(data);
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Impossible de se connecter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FloatingIslandScene 
        onFormVisible={setFormVisible}
        onGameLaunch={() => {}}
        isBlurred={isBlurred}
      />

      {showStart && (
        <div 
          className={`start-screen-wrapper ${!showStart ? 'hidden' : ''}`}
          style={{
            opacity: showStart ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <StartScreen onStart={handleStart} />
        </div>
      )}

      <div className="app" style={{ background: 'transparent' }}>
        <div 
          className="card" 
          style={{
            opacity: isFormVisible ? 1 : 0,
            transform: isFormVisible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.9)',
            transition: 'opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: isFormVisible ? 'auto' : 'none',
          }}
        >
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
    </>
  );
};

export default AuthPage;
