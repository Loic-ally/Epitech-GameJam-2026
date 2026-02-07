import './App.css';
import { LoginPage3D } from './pages/LoginPage3D';
import RoomsPage from './pages/RoomsPage';
import { RoomProvider } from './context/RoomContext';
import { useAuthSession } from './hooks/useAuthSession';

/**
 * Example: Using the 3D Login Page
 * 
 * This shows how to integrate the 3D login page with your existing auth system.
 * Simply replace AuthPage with LoginPage3D in your App.tsx
 */
function AppWith3DLogin() {
  const { session, authenticate, logout } = useAuthSession();

  return (
    <RoomProvider>
      {session ? (
        <RoomsPage user={session.user} onLogout={logout} />
      ) : (
        <LoginPage3D onLoginSuccess={authenticate} />
      )}
    </RoomProvider>
  );
}

export default AppWith3DLogin;
