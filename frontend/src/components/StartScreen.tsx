import React from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1 className="game-title">EpiGang</h1>
      <p className="start-hint">Click enter to get flammed</p>
      <button className="start-button" type="button" onClick={onStart}>
        Enter
      </button>
    </div>
  );
};
