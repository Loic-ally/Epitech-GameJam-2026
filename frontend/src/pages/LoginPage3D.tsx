import React from 'react';
import { LoginScene3D } from '../components/LoginScene3D';
import { AuthSession } from '../types/auth.type';

interface LoginPage3DProps {
  onLoginSuccess?: (session: AuthSession) => void;
}

export const LoginPage3D: React.FC<LoginPage3DProps> = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (session: AuthSession) => {
    console.log('Login successful! Transitioning to game...');
    
    if (onLoginSuccess) {
      // Call the provided callback
      onLoginSuccess(session);
    } else {
      // Fallback behavior for demo/testing
      setTimeout(() => {
        console.log('Navigate to game now!', session);
      }, 2000);
    }
  };

  return <LoginScene3D onLoginSuccess={handleLoginSuccess} />;
};
