import React, { useEffect, useRef, useState } from 'react';
import { LoginScene } from './scene';
import './LoginScene3D.css';
import { AuthSession } from '../../types/auth.type';

interface LoginScene3DProps {
  onLoginSuccess?: (session: AuthSession) => void;
}

export const LoginScene3D: React.FC<LoginScene3DProps> = ({ onLoginSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LoginScene | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trollButton, setTrollButton] = useState({ x: 0, y: 0 });

  const handleTrollHover = () => {
    // Only troll randomly (50% chance?) or always? Let's do always for max troll.
    const container = document.querySelector('.form-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const maxX = containerRect.width - 150; // Approximating button width
    const maxY = containerRect.height - 50;

    // Move to random new position relative to the form container
    // We'll use transform translate
    const newX = (Math.random() - 0.5) * 200; 
    const newY = (Math.random() - 0.5) * 200; // Move up/down significantly

    setTrollButton({ x: newX, y: newY });
  };
  
  const resetTroll = () => {
       // Optional: Reset when mouse leaves, or keep it stuck there?
       // Let's keep it there to be annoying.
  };

  const API_BASE = process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000`;

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    sceneRef.current = new LoginScene(containerRef.current);

    // Cleanup on unmount
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);

  const handleShowForm = () => {
    if (!sceneRef.current || isTransitioning) return;
    
    setIsTransitioning(true);
    sceneRef.current.transitionToForm(() => {
      setShowForm(true);
      setIsTransitioning(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sceneRef.current || isTransitioning || isLoading) return;

    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
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

      const session = (await res.json()) as AuthSession;

      setIsTransitioning(true);
      setShowForm(false);

      sceneRef.current.transitionToGame(() => {
        setIsTransitioning(false);
        if (onLoginSuccess) {
          onLoginSuccess(session);
        }
      });
    } catch (err: any) {
      setError(err?.message || 'Impossible de se connecter');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="login-scene-container">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="canvas-container" />

      {/* Initial Welcome Screen */}
      {!showForm && !isTransitioning && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome to the Island</h1>
            <p className="welcome-subtitle">A magical place awaits</p>
            <button 
              className="enter-button"
              onClick={handleShowForm}
            >
              Enter
            </button>
          </div>
        </div>
      )}

      {/* Login/Register Form */}
      {showForm && (
        <div className={`form-overlay ${showForm ? 'visible' : ''}`}>
          <div className="form-container">
            <h2 className="form-title">
              {isLogin ? 'Login' : 'Register'}
            </h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="firstName">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>
              )}
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isLoading}
                onMouseEnter={isLogin ? undefined : handleTrollHover}
                style={{
                    transform: !isLogin ? `translate(${trollButton.x}px, ${trollButton.y}px)` : undefined,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {isLoading ? '...' : isLogin ? 'Login' : 'Register'}
              </button>
            </form>
            
            <div className="form-footer">
              <button 
                type="button" 
                className="toggle-mode-button"
                onClick={toggleMode}
              >
                {isLogin 
                  ? "Don't have an account? Register" 
                  : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
