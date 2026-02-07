import React, { FormEvent, useMemo, useState } from 'react';
import { Client } from '@colyseus/sdk';
import './App.css';
import FPSGame from './components/FPSGame';
import { useRoom } from './hooks/useRoom';
import AuthPage from './pages/AuthPage';
import RoomsPage from './pages/RoomsPage';
import { RoomProvider } from './context/RoomContext';
import { useAuthSession } from './hooks/useAuthSession';

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
  const { session, authenticate, logout } = useAuthSession();

  return (
    <RoomProvider>
      {session ? (
        <RoomsPage user={session.user} onLogout={logout} />
      ) : (
        <AuthPage onAuthenticated={authenticate} />
      )}
    </RoomProvider>
  );
}

export default App;
