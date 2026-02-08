import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import Animation, { type Rarity } from './Animation';
import MultiPullAnimation, { type PullResult } from './MultiPullAnimation';
import GachaPage, { type Banner } from './components/GachaPage';
import { GACHA_BANNERS } from './data/banners';
import { ALL_THEMES, pickImageTheme, type ThemeName } from './themeEffects';

function pickRarity(banner: Banner, count: 1 | 10): Rarity {
  const order: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
  const roll = Math.random() * 100;
  let cursor = 0;
  let picked: Rarity = 'common';

  for (const key of order) {
    cursor += banner.dropRates[key];
    if (roll <= cursor) {
      picked = key;
      break;
    }
  }

  if (count === 10 && picked === 'common') return 'rare';
  return picked;
}

function App() {
  const [gachaOpen, setGachaOpen] = useState(true);
  const [pull, setPull] = useState<{ banner: Banner; rarity: Rarity; count: 1 | 10; theme: ThemeName } | null>(null);
  const [multiPull, setMultiPull] = useState<PullResult[] | null>(null);

  const highlightedBanner = useMemo(() => GACHA_BANNERS[0], []);

  useEffect(() => {
    // Détecte un combo clavier et déclenche une synthèse vocale thématique.
    const TRIGGER_SEQUENCE = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a', 'Enter',
    ];

    let position = 0;

    const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const key = normalizeKey(event.key);
      const expected = normalizeKey(TRIGGER_SEQUENCE[position]);

      if (key === expected) {
        position += 1;
        if (position === TRIGGER_SEQUENCE.length) {
          position = 0;

          const utterance = new SpeechSynthesisUtterance('al-hayat media center, presents: the gacha simulator');
          utterance.lang = 'en-US';
          utterance.rate = 0.95;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      } else {
        position = key === normalizeKey(TRIGGER_SEQUENCE[0]) ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePull = useCallback((banner: Banner, count: 1 | 10) => {
    if (count === 10) {
      const pulls: PullResult[] = Array.from({ length: 10 }, () => ({
        rarity: pickRarity(banner, count),
        imgTheme: pickImageTheme(),
        imageSrc: banner.image,
      }));
      setMultiPull(pulls);
    } else {
      const rarity = pickRarity(banner, count);
      const theme = ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)];
      setPull({ banner, rarity, count, theme });
    }
  }, []);

  const closeAnimation = useCallback(() => setPull(null), []);
  const closeMultiPull = useCallback(() => setMultiPull(null), []);

  return (
    <div className="world-shell">
      <div className="map-card">
        <div className="map-head">
          <div>
            <p className="eyebrow">Carte</p>
            <h1>Hub principal</h1>
            <p className="muted">
              Déplace-toi sur la map. Le portail gacha est signalé en surbrillance : clique dessus ou sur le bouton
              pour ouvrir la page des bannières.
            </p>
          </div>
          <button className="play" onClick={() => setGachaOpen(true)}>Ouvrir le gacha</button>
        </div>

        <div className="map-grid">
          <div className="map-node">
            <span className="node-title">Hangar Nord</span>
            <span className="node-meta">Boss hebdo</span>
          </div>
          <div className="map-node">
            <span className="node-title">Quartier Est</span>
            <span className="node-meta">Quêtes coop</span>
          </div>
          <button className="map-node map-node--gacha" onClick={() => setGachaOpen(true)}>
            <span className="node-pulse" aria-hidden />
            <span className="node-title">Portail Gacha</span>
            <span className="node-meta">Place du Hub · {highlightedBanner.name}</span>
          </button>
          <div className="map-node">
            <span className="node-title">Tour Sud</span>
            <span className="node-meta">Défis solos</span>
          </div>
          <div className="map-node">
            <span className="node-title">Bunker Ouest</span>
            <span className="node-meta">Zone PvP</span>
          </div>
        </div>
      </div>

      {gachaOpen && (
        <GachaPage
          banners={GACHA_BANNERS}
          onClose={() => setGachaOpen(false)}
          onPull={handlePull}
        />
      )}

      {pull && (
        <Animation
          rarity={pull.rarity}
          theme={pull.theme}
          imageSrc={pull.banner.image}
          onDone={closeAnimation}
        />
      )}

      {multiPull && (
        <MultiPullAnimation pulls={multiPull} onDone={closeMultiPull} />
      )}
    </div>
  );
}

export default App;
