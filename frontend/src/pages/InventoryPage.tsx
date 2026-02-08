import React, { useEffect, useState } from 'react';

type Inventory = {
  summonerCards: number[];
  unitCards: number[];
  activeCards: number[];
};

type Props = {
  token: string;
  onBack: () => void;
};

const API_BASE = (typeof window !== 'undefined'
  ? (process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`)
  : '');

const InventoryPage: React.FC<Props> = ({ token, onBack }) => {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${API_BASE}/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.msg || 'Impossible de charger l\'inventaire');
        }
        const data = await res.json();
        setInventory(data);
      } catch (err: any) {
        setError(err?.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [token]);

  return (
    <div className="world-shell">
      <div className="map-card">
        <div className="map-head">
          <div>
            <p className="eyebrow">Inventaire</p>
            <h1>Cartes possédées</h1>
            <p className="muted">Vue rapide des cartes tirées.</p>
          </div>
          <button className="play" onClick={onBack}>Retour</button>
        </div>

        {loading && <p className="muted">Chargement...</p>}
        {error && <p style={{ color: '#ffb5b5' }}>{error}</p>}

        {inventory && (
          <div className="inventory-list" style={{ display: 'grid', gap: 12 }}>
            <div className="ghost">
              <strong>Summoner</strong>
              <div>{inventory.summonerCards.length ? inventory.summonerCards.join(', ') : 'Aucune'}</div>
            </div>
            <div className="ghost">
              <strong>Unités</strong>
              <div>{inventory.unitCards.length ? inventory.unitCards.join(', ') : 'Aucune'}</div>
            </div>
            <div className="ghost">
              <strong>Actives</strong>
              <div>{inventory.activeCards.length ? inventory.activeCards.join(', ') : 'Aucune'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
