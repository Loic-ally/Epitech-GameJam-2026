import React, { useMemo, useState } from 'react';
import type { Rarity } from '../Animation';
import './GachaPage.css';

export interface Banner {
  id: string;
  name: string;
  codename: string;
  rarity: Rarity;
  element: string;
  role: string;
  location: string;
  accent: string;
  image: string;
  description: string;
  dropRates: Record<Rarity, number>;
  featured: string[];
  until: string;
}

interface Props {
  banners: Banner[];
  onClose: () => void;
  onPull: (banner: Banner, count: 1 | 10) => void;
}

const rarityLabel: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

function BannerCard({
  banner,
  isSelected,
  onSelect,
}: {
  banner: Banner;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`banner-card theme-${banner.id} ${isSelected ? 'is-selected' : ''}`}
      style={{ '--accent': banner.accent } as React.CSSProperties}
      onClick={onSelect}
    >
      <div
        className="banner-card__image"
        style={{ backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.35), rgba(0,0,0,0)), url(${banner.image})` }}
      />
      <div className="banner-card__meta">
        <div className="banner-card__title">{banner.name}</div>
        <div className="banner-card__line">
          <span className="badge">{rarityLabel[banner.rarity]}</span>
          <span className="muted">{banner.codename}</span>
        </div>
        <div className="banner-card__line">
          <span className="pill">{banner.element}</span>
          <span className="pill pill--muted">{banner.location}</span>
        </div>
        <div className="banner-card__date">jusqu'au {banner.until}</div>
      </div>
    </button>
  );
}

export default function GachaPage({ banners, onClose, onPull }: Props) {
  const [selectedId, setSelectedId] = useState<string>(banners[0]?.id ?? '');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const selected = useMemo(() => banners.find((b) => b.id === selectedId) ?? banners[0], [banners, selectedId]);

  return (
    <div className={`gacha-overlay theme-${selected?.id ?? 'default'}`}>
      <div className={`gacha-panel theme-${selected?.id ?? 'default'}`}>
        <div className={`gacha-bg theme-${selected?.id ?? 'default'}`} aria-hidden />
        <header className="gacha-head">
          <div>
            <p className="eyebrow">Zone Gacha</p>
            {view === 'list' ? (
              <>
                <h2>Choisis ta bannière</h2>
                <p className="muted">Page 1/2 · Sélectionne une bannière pour voir ses taux et lancer un tirage.</p>
              </>
            ) : (
              <>
                <h2>{selected?.name}</h2>
                <p className="muted">Page 2/2 · Détails + tirage x1 ou x10.</p>
              </>
            )}
          </div>
          <div className="head-actions">
            {view === 'detail' && (
              <button className="ghost" onClick={() => setView('list')}>Retour liste</button>
            )}
            <button className="ghost" onClick={onClose}>Fermer</button>
          </div>
        </header>

        {view === 'list' && (
          <div className="gacha-body gacha-body--list">
            <div className="banner-list">
              {banners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  isSelected={selected?.id === banner.id}
                  onSelect={() => {
                    setSelectedId(banner.id);
                    setView('detail');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'detail' && selected && (
          <div className="gacha-body gacha-body--detail">
            <section
              className={`banner-details theme-${selected.id}`}
              style={{ '--accent': selected.accent } as React.CSSProperties}
            >
              <div className={`fx-layer fx-${selected.id}`} aria-hidden />
              <div className="details-visual">
                <div
                  className="details-image"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${selected.image})` }}
                  aria-label={selected.name}
                />
                <div className="details-tags">
                  <span className="pill">{selected.element}</span>
                  <span className="pill">{selected.role}</span>
                  <span className="pill">{rarityLabel[selected.rarity]}</span>
                </div>
              </div>

              <div className="details-copy">
                <div className="details-topline">
                  <div>
                    <p className="eyebrow">Bannière sélectionnée</p>
                    <h3>{selected.name}</h3>
                    <p className="muted">{selected.codename}</p>
                  </div>
                  <div className="tagline-chip">{selected.location}</div>
                </div>

                <p className="details-desc">{selected.description}</p>

                <div className="featured">
                  <p className="eyebrow">En vedette</p>
                  <div className="featured-row">
                    {selected.featured.map((item) => (
                      <span key={item} className="pill pill--muted">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="pull-row">
                  <button className="play" onClick={() => onPull(selected, 1)}>Pull x1</button>
                  <button className="play play--ghost" onClick={() => onPull(selected, 10)}>Pull x10</button>
                  <span className="muted tiny">x10 garantit au moins Rare</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
