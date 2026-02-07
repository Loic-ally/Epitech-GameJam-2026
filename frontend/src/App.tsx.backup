import './App.css';
import AuthPage from './pages/AuthPage';
import RoomsPage from './pages/RoomsPage';
import { RoomProvider } from './context/RoomContext';
import { useAuthSession } from './hooks/useAuthSession';

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
