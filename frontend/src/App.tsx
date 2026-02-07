import React, { useState, useCallback } from 'react';
import './App.css';
import Animation from './Animation';
import type { Rarity } from './Animation';
import { ALL_THEMES, ThemeName } from './themeEffects';

/* Human-readable labels for each theme */
const THEME_LABELS: Record<ThemeName, string> = {
  'aer': '🌬️ Aer',
  'lunette': '👓 Lunette',
  'travail': '🔧 Travail',
  'bdg': '💥 BDG',
  'bavard': '🗣️ Bavard',
  'magrehb-united': '🌍 Magrehb United',
  'pas-de-dodo': '😴 Pas de Dodo',
  'tranquilou': '🍃 Tranquilou',
  'moche': '💀 Moche',
  'calvasse': '✨ Calvasse',
  'chinois-de-la-caille': '🏮 Chinois de la Caillé',
  'fou': '🤪 Fou',
  'gourmand': '🍔 Gourmand',
  'vieux': '👴 Vieux',
  'coupe-de-cheveux-supecte': '💇 Coupe Suspecte',
  'nain': '🧝 Nain',
  'menteur': '🤥 Menteur',
  'muet': '🤫 Muet',
  'jamais-a-tek': '👥 Jamais à Tek',
  'zesti': '🍋 Zesti',
  'crack': '⚡ Crack',
  'voix-grave': '🔊 Voix Grave',
  'tchetchene': '🔥 Tchétchène',
};

function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeName | null>(null);

  const handleDone = useCallback(() => setActiveTheme(null), []);

  if (activeTheme) {
    return (
      <Animation
        rarity="legendary"
        theme={activeTheme}
        imageSrc="/victor_ssj.jpg"
        onDone={handleDone}
      />
    );
  }

  return (
    <div className="landing">
      <div className="hero hero--wide">
        <div className="logo-slot" aria-label="Logo Epitech">
          <span>Logo Epitech</span>
        </div>
        <h1 className="title">epitech el djihad</h1>
        <p className="tagline">Choisis un thème pour voir son animation</p>

        <div className="theme-grid">
          {ALL_THEMES.map((theme) => (
            <button
              key={theme}
              className={`theme-btn theme-btn--${theme}`}
              onClick={() => setActiveTheme(theme)}
            >
              <span className="theme-btn__label">{THEME_LABELS[theme] || theme}</span>
            </button>
          ))}
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
