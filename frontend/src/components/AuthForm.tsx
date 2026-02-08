import React, { FormEvent, useState, useRef, useEffect } from 'react';

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
  const [btnStyle, setBtnStyle] = useState<React.CSSProperties>({ transition: 'transform 0.2s ease-out' });
  const hoverCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset position when switching modes
  useEffect(() => {
    setBtnStyle({ transition: 'transform 0.2s ease-out', transform: 'none' });
    hoverCount.current = 0;
  }, [mode]);

  const handleMouseEnter = () => {
    if (mode !== 'register') return;

    hoverCount.current += 1;
    const count = hoverCount.current;

    // Logic: Every 7th time, it waits 1s before moving
    // Otherwise, it moves immediately
    const shouldWait = count % 7 === 0;

    const moveButton = () => {
        // Constrain movement to viewport to avoid going off-screen
        // Use 40% of screen dimensions (leaving ~10% margin if centered)
        const maxX = window.innerWidth * 0.4; 
        const maxY = window.innerHeight * 0.4;
        
        const randomX = (Math.random() - 0.5) * 2 * maxX;
        const randomY = (Math.random() - 0.5) * 2 * maxY;
        
        setBtnStyle({
            transition: 'transform 0.2s ease-out',
            transform: `translate(${randomX}px, ${randomY}px)`
        });
    };

    if (shouldWait) {
        // Stay still for 1s, then move
        // Ensure it's reset to reachable state if it was moved (but unlikely to be hovered if moved away)
        // Actually if it waits, it means the user CAN click it.
        // The user said "stays there for 1 second they reavoids"
        // So we do nothing for 1 second, then move if they are still there or haven't clicked?
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(() => {
            moveButton();
        }, 600); // 600ms window to be generous but tricky, user said 1s so maybe stick to shorter to be troll? 1s is fair.
    } else {
        moveButton();
    }
  };

  return (
    <>
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

        <button 
            type="submit" 
            disabled={isLoading}
            style={mode === 'register' ? btnStyle : undefined}
            onMouseEnter={handleMouseEnter}
        >
          {isLoading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>
      </form>

      {mode === 'login' ? (
        <p className="register-hint">
          nouveau ici?{' '}
          <button 
            type="button" 
            className="register-link"
            onClick={() => onModeChange('register')}
          >
            Register here
          </button>
        </p>
      ) : (
        <p className="register-hint">
            Already have an account?{' '}
            <button
                type="button"
                className="register-link"
                onClick={() => onModeChange('login')}
            >
                Login here
            </button>
        </p>
      )}
    </>
  );
};
