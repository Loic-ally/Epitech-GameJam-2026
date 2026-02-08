import React from 'react';
import '../styles/SummonResult.css';

export interface SummonResult {
  id: string;
  name: string;
  rarity: string;
  image: string;
}

interface SummonResultScreenProps {
  results: SummonResult[];
  onDone: () => void;
}

export default function SummonResultScreen({ results, onDone }: SummonResultScreenProps) {
  return (
    <div className="summon-result-screen">
      <div className="result-container">
        <button className="close-button" aria-label="Fermer le résumé" onClick={onDone}>
          ×
        </button>
        <h2 className="result-title">Résumé des Invocations</h2>
        <p className="pull-counter">{results.length} carte{results.length > 1 ? 's' : ''} obtenue{results.length > 1 ? 's' : ''}</p>

        <div className="revealed-cards-grid">
          {results.map((item) => (
            <div key={item.id} className={`revealed-card-item rarity-${item.rarity}`}>
              <div className="card-image-wrapper">
                <img
                  src={item.image}
                  alt={item.name}
                  className="card-revealed-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"%3E%3Crect fill="%23222" width="100" height="140" rx="6"/%3E%3Ctext x="50%25" y="50%25" font-size="10" fill="%2318d3c5" text-anchor="middle" dominant-baseline="middle"%3E' +
                      encodeURIComponent(item.name) +
                      '%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <h3 className="card-revealed-name">{item.name}</h3>
              <p className="card-revealed-rarity">{item.rarity}</p>
            </div>
          ))}
        </div>

        <button className="done-button" onClick={onDone}>
          Terminé
        </button>
      </div>
    </div>
  );
}
