import React, { useRef, useState } from 'react';
import { LoginScene } from '../components/LoginScene3D/scene';

/**
 * Standalone demo component for testing the 3D scene
 * This bypasses React integration to show pure Three.js functionality
 */
export const ThreeJSDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LoginScene | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initScene = () => {
    if (!containerRef.current || sceneRef.current) return;
    
    sceneRef.current = new LoginScene(containerRef.current);
    setIsInitialized(true);
  };

  const testTransitionToForm = () => {
    if (!sceneRef.current) return;
    
    sceneRef.current.transitionToForm(() => {
      console.log('✅ Transition to form completed!');
    });
  };

  const testTransitionToGame = () => {
    if (!sceneRef.current) return;
    
    sceneRef.current.transitionToGame(() => {
      console.log('🚀 Transition to game completed!');
      alert('Launch sequence complete! The island is now spinning fast.');
    });
  };

  const resetScene = () => {
    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
      setIsInitialized(false);
    }
    
    setTimeout(() => {
      initScene();
    }, 100);
  };

  React.useEffect(() => {
    initScene();
    
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        minWidth: '250px',
        zIndex: 1000,
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#333' }}>
          🎮 Test Controls
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={testTransitionToForm}
            disabled={!isInitialized}
            style={{
              padding: '0.75rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
            }}
          >
            ⬅️ Transition to Form
          </button>
          
          <button
            onClick={testTransitionToGame}
            disabled={!isInitialized}
            style={{
              padding: '0.75rem',
              background: '#764ba2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
            }}
          >
            🚀 Transition to Game
          </button>
          
          <button
            onClick={resetScene}
            disabled={!isInitialized}
            style={{
              padding: '0.75rem',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
            }}
          >
            🔄 Reset Scene
          </button>
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f7fafc',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#666',
        }}>
          <strong>Instructions:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
            <li>Drag to rotate view</li>
            <li>Test animations with buttons</li>
            <li>Check console for logs</li>
          </ul>
        </div>
      </div>
      
      {/* Scene Info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        maxWidth: '300px',
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Scene Info</h4>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
          <li>Floating Island with building</li>
          <li>Cathedral spire on corner</li>
          <li>~15 animated clouds</li>
          <li>Procedural brick texture</li>
          <li>GSAP-powered transitions</li>
        </ul>
      </div>
    </div>
  );
};
