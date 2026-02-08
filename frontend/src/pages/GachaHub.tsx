import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../App.css';
import Animation, { type Rarity } from '../Animation';
import GachaPage, { type Banner } from '../components/GachaPage';
import { GACHA_BANNERS } from '../data/banners';
import { pullGacha } from '../api/gacha';

const API_BASE = (typeof window !== 'undefined'
  ? (process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`)
  : '');

function normalizeRarity(raw: string): Rarity {
  const v = raw.toLowerCase();
  if (v === 'commune' || v === 'common') return 'common';
  if (v === 'rare') return 'rare';
  if (v === 'epique' || v === 'epic') return 'epic';
  if (v === 'legendaire' || v === 'legendary') return 'legendary';
  return 'common';
}

function buildCardImageUrl(card: { image?: string; cardType?: string }): string {
  if (!card.image) return '';
  const assetBase = API_BASE.replace(/\/api$/, '');
  if (card.cardType === 'summoner') {
    return `${assetBase}/invocator-card/${card.image}`;
  }
  return `${assetBase}/unit-card/${card.image}`;
}

const TRIGGER_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a', 'Enter',
];

const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

type Props = {
  startOpen?: boolean;
};

function GachaHub({ startOpen = false }: Props) {
  const [gachaOpen, setGachaOpen] = useState(startOpen);
  const [pull, setPull] = useState<{ banner: Banner; rarity: Rarity; count: 1 | 10; image: string } | null>(null);

  const highlightedBanner = useMemo(() => GACHA_BANNERS[0], []);

  useEffect(() => {
    let position = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const key = normalizeKey(event.key);
      const expected = normalizeKey(TRIGGER_SEQUENCE[position]);

      if (key === expected) {
        position += 1;
        if (position === TRIGGER_SEQUENCE.length) {
          position = 0;

          const utterance = new SpeechSynthesisUtterance('al-hayat media center, presents:');
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

  const handlePull = useCallback(async (banner: Banner, count: 1 | 10) => {
    const saved = localStorage.getItem('egj-auth-session');
    if (!saved) { alert('Connecte-toi pour tirer des cartes.'); return; }
    const session = JSON.parse(saved);
    if (!session?.token) { alert('Session invalide, reconnecte-toi.'); return; }

    try {
      const data = await pullGacha(session.token, count);
      const first = data.pulls[0];
      const rarity = normalizeRarity(first?.rarity || 'common');
      const image = first ? buildCardImageUrl(first) : banner.image;
      setPull({ banner, rarity, count, image });
    } catch (err: any) {
      alert(err?.message || 'Erreur pendant le pull');
    }
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
          imageSrc={pull.image}
          onDone={closeAnimation}
        />
      )}
    </div>
  );
}

export default GachaHub;
