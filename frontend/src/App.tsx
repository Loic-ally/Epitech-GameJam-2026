import React, { useState, useCallback } from 'react';
import './App.css';
import Animation from './Animation';
import type { Rarity } from './Animation';

function App() {
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const handleDone = useCallback(() => setPlaying(false), []);

  if (playing) {
    return (
      <Animation
        rarity="common"
        imageSrc="/victor_ssj.jpg"
        onDone={handleDone}
      />
    );
  }

  return (
    <div className="landing">
      <div className="hero">
        <div className="logo-slot" aria-label="Logo Epitech">
          <span>Logo Epitech</span>
        </div>
        <h1 className="title">epitech el djihad</h1>
        <p className="tagline">Le jeu le plus innovant de tout Epitech</p>
        <div className="cta-row">
          <button className="play" onClick={handlePlay}>
            Jouer
          </button>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid" />
      </div>
    </div>
  );
}

export default App;
