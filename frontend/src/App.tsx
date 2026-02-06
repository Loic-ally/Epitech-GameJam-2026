import React, { FormEvent, useMemo, useState } from 'react';
import { Client, Room } from '@colyseus/sdk';
import './App.css';
import FPSGame from './components/FPSGame';
import { useRoom } from './hooks/useRoom';

const ENDPOINT =
  process.env.REACT_APP_COLYSEUS_ENDPOINT?.trim() ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
    window.location.hostname || 'localhost'
  }:3000`;

const API_BASE =
  process.env.REACT_APP_API_BASE?.trim() ||
  `${window.location.protocol}//${window.location.hostname || 'localhost'}:3000`;

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

function App() {
  const { room, setRoom } = useRoom();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [status, setStatus] = useState('Connecte-toi pour rejoindre le lobby.');
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const client = useMemo(() => new Client(ENDPOINT), []);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatus('Email et mot de passe sont requis.');
      return;
    }
    if (mode === 'register' && (!firstName.trim() || !lastName.trim())) {
      setStatus('Prénom et Nom sont requis pour créer un compte.');
      return;
    }

    setIsAuthLoading(true);
    setStatus('Authentification en cours...');

    try {
      const res = await fetch(`${API_BASE}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: mode === 'register' ? firstName : undefined,
          lastName: mode === 'register' ? lastName : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Auth failed');

      setUser(data.user);
      setToken(data.token);
      setStatus(
        `Connecté en tant que ${data.user.firstName} ${data.user.lastName}. Tu peux rejoindre le lobby.`
      );
    } catch (err: any) {
      setStatus(`Erreur auth: ${err?.message ?? 'unknown'}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleJoinLobby = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setStatus('Connecte-toi avant de rejoindre le lobby.');
      return;
    }

    setIsJoining(true);
    setStatus('Connecting to lobby...');

    try {
      const joinedRoom = await client.joinOrCreate('my_room', {
        username: `${user.firstName} ${user.lastName}`,
        userId: user.id,
        token,
      });
      setRoom(joinedRoom);
      setStatus(`Joined lobby as ${user.firstName}. Room id: ${joinedRoom.roomId}`);

      joinedRoom.onLeave((code: number) => {
        setStatus(`Disconnected from lobby (code ${code}).`);
        setRoom(null);
      });
      joinedRoom.onError((code: number | undefined, message: string | undefined) => {
        setStatus(`Room error (${code}): ${message ?? 'unknown error'}`);
      });
    } catch (error) {
      console.error('Failed to join lobby', error);
      const reason = (error as any)?.message || 'unknown error';
      setStatus(`Unable to join lobby (${reason}). Endpoint: ${ENDPOINT}`);
    } finally {
      setIsJoining(false);
    }
  };

  if (room) {
    return <FPSGame />;
  }

  return (
    <div className="app">
      <div className="card">
        <h1>Connexion</h1>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="form" onSubmit={handleAuth}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isAuthLoading}
          />

          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••"
            disabled={isAuthLoading}
          />

          {mode === 'register' && (
            <>
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Prénom"
                disabled={isAuthLoading}
              />

              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Nom"
                disabled={isAuthLoading}
              />
            </>
          )}

          <button type="submit" disabled={isAuthLoading}>
            {isAuthLoading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>
        </form>

        <div className="divider" />

        <form className="form" onSubmit={handleJoinLobby}>
          <label>Lobby</label>
          <button type="submit" disabled={isJoining || !!room || !user}>
            {room ? 'Connecté' : isJoining ? 'Connexion...' : 'Rejoindre le lobby'}
          </button>
        </form>

        <p className="status">{status}</p>
        <p className="status">Endpoint WS: {ENDPOINT}</p>
        <p className="status">API: {API_BASE}</p>

        {room && (
          <div className="room-details">
            <div>
              <strong>Room ID:</strong> {room.roomId}
            </div>
            <div>
              <strong>Session ID:</strong> {room.sessionId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
