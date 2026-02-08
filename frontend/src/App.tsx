import './App.css';
import AuthPage from './pages/AuthPage';
import RoomsPage from './pages/RoomsPage';
import GachaHub from './pages/GachaHub';
import { RoomProvider } from './context/RoomContext';
import { useAuthSession } from './hooks/useAuthSession';

function App() {
  const { session, authenticate, logout } = useAuthSession();
  const isPullPreview = typeof window !== 'undefined' && window.location.pathname === '/pull';

  if (isPullPreview) {
    return <GachaHub startOpen />;
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
