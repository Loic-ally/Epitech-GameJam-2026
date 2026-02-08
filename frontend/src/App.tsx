import React from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import RoomsPage from './pages/RoomsPage';
import { RoomProvider } from './context/RoomContext';
import { useAuthSession } from './hooks/useAuthSession';
import GachaPage from './components/GachaPage';
import { GACHA_BANNERS } from './data/banners';

function App() {
  const { session, authenticate, logout } = useAuthSession();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  if (path === '/pull') {
    return (
      <div className="world-shell">
        <GachaPage
          banners={GACHA_BANNERS}
          onClose={() => window.history.back()}
          onPull={() => {}}
        />
      </div>
    );
  }

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
