import type React from 'react';
import type { HandCard } from '../../types/battle.type';

interface HandCardProps {
  card: HandCard;
  disabled?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const CARD_TYPE_ICONS: Record<string, string> = {
  buff_ATK: '⚔️',
  buff_DEF: '🛡️',
  heal: '💚',
  damage: '🔥',
  special: '⭐',
};

const CARD_TYPE_BORDER: Record<string, string> = {
  buff_ATK: 'rgba(244, 67, 54, 0.4)',
  buff_DEF: 'rgba(33, 150, 243, 0.4)',
  heal: 'rgba(76, 175, 80, 0.4)',
  damage: 'rgba(255, 152, 0, 0.4)',
  special: 'rgba(224, 64, 251, 0.4)',
};

const HandCardComponent: React.FC<HandCardProps> = ({ card, disabled, isSelected, onClick }) => {
  return (
    <button 
      type="button"
      className={`hand-card ${disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={{ borderColor: CARD_TYPE_BORDER[card.type] || undefined }} >
      <div className="hand-card-value">{card.value}</div>
      <div className={`hand-card-icon card-type-${card.type}`}>
        {CARD_TYPE_ICONS[card.type] || '🃏'}
      </div>
      <div className="hand-card-name">{card.name}</div>
      <div className="hand-card-desc">{card.description}</div>
    </button>
  );
};

export default HandCardComponent;
