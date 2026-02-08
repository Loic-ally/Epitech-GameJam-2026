import React, { useEffect, useMemo, useState } from 'react';
import '../App.css';
import './DeckBuilderPage.css';
import type { InvocatorCard, UnitCard } from '../types/battle.type';

interface InventoryPayload {
  summonerCards?: number[] | number[][];
  unitCards?: number[] | number[][];
  activeCards?: number[] | number[][];
}

interface DeckPayload {
  summonerCards?: number;
  unitCards?: number[] | number[][];
  activeCards?: number[] | number[][];
}

interface DeckBuilderPageProps {
  token: string;
  onBack: () => void;
}

const API_BASE = (typeof window !== 'undefined'
  ? (process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`)
  : '');

const flattenIds = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.flat(Infinity).filter((v) => typeof v === 'number') as number[];
  }
  if (typeof value === 'number') return [value];
  return [];
};

const DeckBuilderPage: React.FC<DeckBuilderPageProps> = ({ token, onBack }) => {
  const [inventory, setInventory] = useState<InventoryPayload | null>(null);
  const [deck, setDeck] = useState<DeckPayload | null>(null);
  const [invocators, setInvocators] = useState<InvocatorCard[]>([]);
  const [units, setUnits] = useState<UnitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const [selectedSummonerId, setSelectedSummonerId] = useState<number | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);

  const assetBase = useMemo(() => API_BASE.replace(/\/api$/, ''), []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [invRes, deckRes, cardsRes] = await Promise.all([
          fetch(`${API_BASE}/inventory`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/deck`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/cards`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!invRes.ok) {
          const data = await invRes.json().catch(() => ({}));
          throw new Error(data?.msg || "Impossible de charger l'inventaire");
        }

        const inv = await invRes.json();
        setInventory(inv);

        if (deckRes.ok) {
          const deckData = await deckRes.json();
          setDeck(deckData);
        } else {
          setDeck(null);
        }

        if (!cardsRes.ok) {
          const data = await cardsRes.json().catch(() => ({}));
          throw new Error(data?.msg || 'Impossible de charger les cartes');
        }

        const cardsData = await cardsRes.json();
        setInvocators(cardsData.invocators ?? []);
        setUnits(cardsData.units ?? []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const ownedSummonerIds = useMemo(
    () => flattenIds(inventory?.summonerCards),
    [inventory]
  );
  const ownedUnitIds = useMemo(
    () => flattenIds(inventory?.unitCards),
    [inventory]
  );

  const ownedSummonerSet = useMemo(() => new Set(ownedSummonerIds), [ownedSummonerIds]);
  const ownedUnitSet = useMemo(() => new Set(ownedUnitIds), [ownedUnitIds]);

  const summonerPool = ownedSummonerIds;

  const allSummoners = useMemo(
    () => invocators,
    [invocators]
  );

  const allUnits = useMemo(
    () => units,
    [units]
  );

  useEffect(() => {
    const deckSummoner = typeof deck?.summonerCards === 'number' ? deck?.summonerCards : null;
    const deckUnits = flattenIds(deck?.unitCards);

    const summonerId = deckSummoner && summonerPool.includes(deckSummoner) ? deckSummoner : null;
    const unitIds = deckUnits.filter((id) => ownedUnitIds.includes(id)).slice(0, 6);

    if (summonerId !== null) {
      setSelectedSummonerId(summonerId);
    }
    if (unitIds.length > 0) {
      setSelectedUnitIds(unitIds);
    }
  }, [deck, summonerPool, ownedUnitIds]);

  const toggleUnit = (id: number) => {
    setStatus('');
    if (!ownedUnitSet.has(id)) {
      setStatus('Carte verrouillee.');
      return;
    }
    setSelectedUnitIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 6) {
        setStatus('Tu peux selectionner maximum 6 unites.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const saveDeck = async () => {
    setStatus('');
    if (!selectedSummonerId) {
      setStatus('Choisis un invocateur.');
      return;
    }
    if (selectedUnitIds.length === 0) {
      setStatus('Choisis au moins une unite.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        summonerCards: selectedSummonerId,
        unitCards: [selectedUnitIds],
        activeCards: [],
      };
      const res = await fetch(`${API_BASE}/deck`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.msg || 'Impossible de sauvegarder le deck');
      }
      setStatus('Deck sauvegarde.');
    } catch (err: any) {
      setStatus(err?.message || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="world-shell">
      <div className="map-card deck-builder">
        <div className="map-head">
          <div>
            <p className="eyebrow">Deck Builder</p>
            <h1>Equipe ton deck</h1>
            <p className="muted">Choisis 1 invocateur et jusqu'a 6 unites.</p>
          </div>
          <div className="deck-actions">
            <button className="ghost" onClick={onBack}>Retour</button>
            <button className="play" onClick={saveDeck} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {loading && <p className="muted">Chargement...</p>}
        {error && <p style={{ color: '#ffb5b5' }}>{error}</p>}
        {status && <p className="deck-status-info">{status}</p>}

        {!loading && !error && (
          <div className="deck-grid">
            <section className="deck-panel">
              <div className="deck-panel__head">
                <h2>Invocateur</h2>
                <span className="deck-panel__meta">1 selection</span>
              </div>
              <div className="card-grid">
                {allSummoners.length === 0 && (
                  <div className="deck-empty">Aucun invocateur disponible.</div>
                )}
                {allSummoners.map((card) => {
                  const owned = ownedSummonerSet.has(card.id);
                  const selected = card.id === selectedSummonerId;
                  const imageUrl = card.image ? `${assetBase}/invocator-card/${card.image}` : '';
                  return (
                    <button
                      key={card.id}
                      className={`deck-card ${selected ? 'selected' : ''} ${owned ? '' : 'locked'}`}
                      onClick={() => {
                        if (!owned) {
                          setStatus('Carte verrouillee.');
                          return;
                        }
                        setSelectedSummonerId(card.id);
                      }}
                      type="button"
                      disabled={!owned}
                    >
                      <div
                        className="deck-card__image"
                        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
                      />
                      <div className="deck-card__body">
                        <div className="deck-card__title">{card.name}</div>
                        <div className="deck-card__sub">{card.rarity}</div>
                        <div className="deck-card__meta">{card.promo}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="deck-panel">
              <div className="deck-panel__head">
                <h2>Unites</h2>
                <span className="deck-panel__meta">{selectedUnitIds.length}/6 selectionnees</span>
              </div>
              <div className="card-grid">
                {allUnits.length === 0 && (
                  <div className="deck-empty">Aucune unite disponible.</div>
                )}
                {allUnits.map((card) => {
                  const owned = ownedUnitSet.has(card.id);
                  const selected = selectedUnitIds.includes(card.id);
                  const imageUrl = card.image ? `${assetBase}/unit-card/${card.image}` : '';
                  return (
                    <button
                      key={card.id}
                      className={`deck-card ${selected ? 'selected' : ''} ${owned ? '' : 'locked'}`}
                      onClick={() => toggleUnit(card.id)}
                      type="button"
                      disabled={!owned}
                    >
                      <div
                        className="deck-card__image"
                        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
                      />
                      <div className="deck-card__body">
                        <div className="deck-card__title">{card.name}</div>
                        <div className="deck-card__sub">{card.rarity} - {card.category}</div>
                        <div className="deck-card__stats">
                          <span>HP {card.stats?.HP ?? 0}</span>
                          <span>ATK {card.stats?.ATK ?? 0}</span>
                          <span>DEF {card.stats?.DEF ?? 0}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckBuilderPage;
