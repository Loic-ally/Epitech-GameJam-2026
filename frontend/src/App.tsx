import React, { useCallback, useMemo, useState } from 'react';
import './App.css';
import Animation, { type Rarity } from './Animation';
import GachaPage, { type Banner } from './components/GachaPage';
import { GACHA_BANNERS } from './data/banners';

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
  const [pull, setPull] = useState<{ banner: Banner; rarity: Rarity; count: 1 | 10 } | null>(null);

  const highlightedBanner = useMemo(() => GACHA_BANNERS[0], []);

  const handlePull = useCallback((banner: Banner, count: 1 | 10) => {
    const rarity = pickRarity(banner, count);
    setPull({ banner, rarity, count });
  }, []);

  const closeAnimation = useCallback(() => setPull(null), []);

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
          theme="crack"
          imageSrc={pull.banner.image}
          onDone={closeAnimation}
        />
      )}
    </div>
  );
}

export default App;
