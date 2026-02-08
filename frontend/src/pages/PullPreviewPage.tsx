import React, { useState } from 'react';
import GachaPage, { type Banner } from '../components/GachaPage';
import Animation, { type Rarity } from '../Animation';
import MultiPullAnimation from '../MultiPullAnimation';
import SummonResultScreen, { type SummonResult } from '../components/SummonResultScreen';
import { pickImageTheme } from '../themeEffects';
import { pullGacha } from '../api/gacha';

type Props = {
  banners: Banner[];
  onClose: () => void;
};

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

export default function PullPreviewPage({ banners, onClose }: Props) {
  const [previewPull, setPreviewPull] = useState<{
    banner: Banner;
    results: SummonResult[];
    count: 1 | 10;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [pulling, setPulling] = useState(false);

  const handlePreviewPull = async (banner: Banner, count: 1 | 10) => {
    const saved = localStorage.getItem('egj-auth-session');
    if (!saved) { alert('Connecte-toi pour tirer des cartes.'); return; }
    const session = JSON.parse(saved);
    if (!session?.token) { alert('Session invalide, reconnecte-toi.'); return; }

    setPulling(true);
    try {
      const data = await pullGacha(session.token, count);
      const results: SummonResult[] = data.pulls.map((c, i) => ({
        id: `${banner.id}-${Date.now()}-${i}`,
        name: c.name || `Carte #${c.id}`,
        rarity: normalizeRarity(c.rarity || 'common'),
        image: buildCardImageUrl(c),
      }));
      setShowResults(false);
      setPreviewPull({ banner, results, count });
    } catch (err: any) {
      alert(err?.message || 'Erreur pendant le pull');
    } finally {
      setPulling(false);
    }
  };

  const resetPreview = () => {
    setPreviewPull(null);
    setShowResults(false);
  };

  return (
    <div className="world-shell">
      <GachaPage banners={banners} onClose={onClose} onPull={handlePreviewPull} />

      {previewPull && previewPull.count === 1 && !showResults && (
        <Animation
          rarity={previewPull.results[0].rarity as Rarity}
          theme={previewPull.banner.theme}
          imageSrc={previewPull.results[0].image}
          onDone={() => setShowResults(true)}
        />
      )}

      {previewPull && previewPull.count === 10 && !showResults && (
        <MultiPullAnimation
          pulls={previewPull.results.map((r) => ({
            rarity: r.rarity as Rarity,
            imgTheme: pickImageTheme(),
            imageSrc: r.image,
          }))}
          onDone={() => setShowResults(true)}
        />
      )}

      {previewPull && showResults && (
        <SummonResultScreen results={previewPull.results} onDone={resetPreview} />
      )}
    </div>
  );
}
