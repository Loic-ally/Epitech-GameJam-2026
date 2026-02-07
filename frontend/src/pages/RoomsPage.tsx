import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../App.css';
import { LobbyPanel } from '../components/LobbyPanel';
import { StatusPanel } from '../components/StatusPanel';
import { AuthUser } from '../types/auth';
import { useRoom } from '../hooks/useRoom';
import { Client, Room } from '@colyseus/sdk';
import FPSGame from '../components/FPSGame';

export interface RoomsPageProps {
  user: AuthUser;
  onLogout: () => void;
}

const WS_ENDPOINT =
  process.env.REACT_APP_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3000`;
const API_ENDPOINT =
  process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`;

const RoomsPage: React.FC<RoomsPageProps> = ({ user, onLogout }) => {
  const { room, setRoom } = useRoom();
  const [isJoining, setIsJoining] = useState(false);
  const [status, setStatus] = useState('Connecté');
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => new Client(WS_ENDPOINT), []);
  const activeRoomRef = useRef<Room | null>(null);

  const userFirstName = user?.firstName || 'Utilisateur';
  const userDisplay = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.email || 'Utilisateur';

  useEffect(() => {
    return () => {
      activeRoomRef.current?.leave();
    };
  }, []);

  const handleJoinLobby = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (room) return <FPSGame/>;

    setIsJoining(true);
    setError(null);
    setStatus('Connexion au lobby...');

    try {
      const joinedRoom = await client.joinOrCreate('my_room', {
        displayName: userDisplay,
      });

      activeRoomRef.current = joinedRoom;
      setRoom(joinedRoom);
      setStatus(`Connecté au lobby (${joinedRoom.roomId})`);

      joinedRoom.onLeave((code: number) => {
        setStatus(`Déconnecté du lobby (code ${code})`);
        setRoom(null);
        activeRoomRef.current = null;
      });
    } catch (err: any) {
      setError(err?.message ?? 'Connexion au lobby impossible');
      setStatus('Erreur de connexion au lobby');
    } finally {
      setIsJoining(false);
    }
  };

  if (room)
    return <FPSGame />
  return (
    <div className="app">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Rooms</h1>
          <button style={{ maxWidth: 140 }} onClick={onLogout}>
            Se déconnecter
          </button>
        </div>

        <p className="status">Bienvenue, {userFirstName}</p>

        <LobbyPanel userDisplay={userFirstName} room={room} isJoining={isJoining} onJoin={handleJoinLobby} />

        {room && (
          <div className="room-details">
            <div><strong>Lobby:</strong> {room.name ?? 'my_room'}</div>
            <div><strong>Lobby ID:</strong> {room.roomId}</div>
            <div><strong>Session:</strong> {room.sessionId}</div>
          </div>
        )}

        <div className="divider" />
        <StatusPanel status={status} wsEndpoint={WS_ENDPOINT} apiEndpoint={API_ENDPOINT} />
        {error && <p className="status" style={{ color: '#ffb5b5' }}>{error}</p>}
      </div>
    </div>
  );
};

export default RoomsPage;
