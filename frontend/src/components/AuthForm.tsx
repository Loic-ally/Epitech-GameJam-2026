import React, { FormEvent } from 'react';

type Mode = 'login' | 'register';

export interface AuthFormProps {
  mode: Mode;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isLoading: boolean;
  onModeChange: (mode: Mode) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  email,
  password,
  firstName,
  lastName,
  isLoading,
  onModeChange,
  onChangeEmail,
  onChangePassword,
  onChangeFirstName,
  onChangeLastName,
  onSubmit,
}) => {
  return (
    <>
      <div className="mode-switch">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => onModeChange('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => onModeChange('register')}
        >
          Register
        </button>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => onChangeEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => onChangePassword(e.target.value)}
          placeholder="••••••"
          disabled={isLoading}
        />

        {mode === 'register' && (
          <>
            <label htmlFor="firstName">Prénom</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => onChangeFirstName(e.target.value)}
              placeholder="Prénom"
              disabled={isLoading}
            />

            <label htmlFor="lastName">Nom</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => onChangeLastName(e.target.value)}
              placeholder="Nom"
              disabled={isLoading}
            />
          </>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>
      </form>
    </>
  );
};
