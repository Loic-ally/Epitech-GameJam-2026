#!/bin/bash

# Quick switch script for testing the 3D login page
# Usage: ./switch-to-3d.sh [demo|full|restore]

FRONTEND_DIR="/Users/vivi/Documents/gamejam/Epitech-GameJam-2026/frontend"
APP_FILE="$FRONTEND_DIR/src/App.tsx"
BACKUP_FILE="$FRONTEND_DIR/src/App.tsx.backup"

case "$1" in
  demo)
    echo "🎮 Switching to 3D Demo mode..."
    
    # Backup current App.tsx if not already backed up
    if [ ! -f "$BACKUP_FILE" ]; then
      cp "$APP_FILE" "$BACKUP_FILE"
      echo "✅ Backed up current App.tsx"
    fi
    
    # Create demo App.tsx
    cat > "$APP_FILE" << 'EOF'
import React from 'react';
import { ThreeJSDemo } from './components/ThreeJSDemo';
import './App.css';

function App() {
  return <ThreeJSDemo />;
}

export default App;
EOF
    
    echo "✅ Switched to 3D Demo mode"
    echo "🚀 Run 'npm start' in the frontend directory to test"
    ;;
    
  full)
    echo "🎮 Switching to full 3D Login page..."
    
    # Backup current App.tsx if not already backed up
    if [ ! -f "$BACKUP_FILE" ]; then
      cp "$APP_FILE" "$BACKUP_FILE"
      echo "✅ Backed up current App.tsx"
    fi
    
    # Create full login App.tsx
    cat > "$APP_FILE" << 'EOF'
import './App.css';
import { LoginPage3D } from './pages/LoginPage3D';
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
        <LoginPage3D onLoginSuccess={authenticate} />
      )}
    </RoomProvider>
  );
}

export default App;
EOF
    
    echo "✅ Switched to full 3D Login page"
    echo "🚀 Run 'npm start' in the frontend directory to test"
    ;;
    
  restore)
    if [ -f "$BACKUP_FILE" ]; then
      cp "$BACKUP_FILE" "$APP_FILE"
      echo "✅ Restored original App.tsx"
      rm "$BACKUP_FILE"
      echo "✅ Removed backup file"
    else
      echo "❌ No backup file found"
      exit 1
    fi
    ;;
    
  *)
    echo "Usage: $0 [demo|full|restore]"
    echo ""
    echo "  demo    - Switch to 3D demo with test controls"
    echo "  full    - Switch to full 3D login page with auth"
    echo "  restore - Restore original App.tsx"
    echo ""
    echo "Example:"
    echo "  $0 demo     # Test the 3D scene"
    echo "  $0 full     # Use full login page"
    echo "  $0 restore  # Go back to original"
    exit 1
    ;;
esac
