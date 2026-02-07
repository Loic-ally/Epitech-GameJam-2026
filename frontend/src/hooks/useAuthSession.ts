import { useEffect, useState } from 'react';
import { AuthSession } from '../types/auth.type';

const SESSION_KEY = 'egj-auth-session';

export const useAuthSession = () => {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as AuthSession;
      if (parsed?.token && parsed?.user && parsed.user.email && parsed.user.firstName) {
        setSession(parsed);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (err) {
      console.warn('Unable to restore session', err);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const authenticate = (nextSession: AuthSession) => {
    setSession(nextSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return { session, authenticate, logout };
};
