import React from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1 className="game-title">GatchaTek</h1>
      <p className="start-hint">Tap to enter the island</p>
      <button className="start-button" type="button" onClick={onStart}>
        Enter
      </button>
    </div>
  );
};
