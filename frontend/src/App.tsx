import React, { FormEvent, useMemo, useState } from 'react';
import { Client, Room } from '@colyseus/sdk';
import './App.css';

const ENDPOINT =
  process.env.REACT_APP_COLYSEUS_ENDPOINT?.trim() ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
    window.location.hostname || 'localhost'
  }:3000`;

function App() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('Enter a username to join the lobby.');
  const [room, setRoom] = useState<Room | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const client = useMemo(() => new Client(ENDPOINT), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      setStatus('Please choose a username first.');
      return;
    }

    setIsJoining(true);
    setStatus('Connecting to lobby...');

    try {
      const joinedRoom = await client.joinOrCreate('my_room', { username });
      setRoom(joinedRoom);
      setStatus(`Joined lobby as ${username}. Room id: ${joinedRoom.roomId}`);

      joinedRoom.onLeave((code: number) => {
        setStatus(`Disconnected from lobby (code ${code}).`);
        setRoom(null);
      });
      joinedRoom.onError((code, message) => {
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

  return (
    <div className="app">
      <div className="card">
        <h1>Lobby Login</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Player name"
            disabled={!!room || isJoining}
          />
          <button type="submit" disabled={isJoining || !!room}>
            {room ? 'Connected' : isJoining ? 'Joining…' : 'Join Lobby'}
          </button>
        </form>

        <p className="status">{status}</p>
        <p className="status">Endpoint: {ENDPOINT}</p>

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
