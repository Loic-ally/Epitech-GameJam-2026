import type React from 'react';
import type { ChampionInBattle } from '../../types/battle.type';
import { RARITY_COLORS, CATEGORY_ICONS } from '../../data/placeholders';

interface ChampionCardProps {
  champion: ChampionInBattle;
  isEnemy?: boolean;
  isSelected?: boolean;
  isTargetable?: boolean;
  isAttacking?: boolean;
  onClick?: () => void;
  showDamage?: boolean;
  assetBaseUrl?: string;
  isHit?: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
}

const ChampionCardComponent: React.FC<ChampionCardProps> = ({
  champion,
  isEnemy,
  isSelected,
  isTargetable,
  isAttacking,
  onClick,
  showDamage,
  assetBaseUrl,
  isHit,
  cardRef,
}) => {
  const { card, currentHP, maxHP, isAlive } = champion;
  const hpPercent = Math.max(0, (currentHP / maxHP) * 100);
  const rarityColor = RARITY_COLORS[card.rarity] || RARITY_COLORS.commune;
  const categoryIcon = CATEGORY_ICONS[card.category] || '⚔️';
  const baseUrl = assetBaseUrl ?? '';
  const imageUrl = card.image ? `${baseUrl}/unit-card/${card.image}` : '';

  const hpClass = hpPercent > 60 ? 'hp-high' : hpPercent > 25 ? 'hp-mid' : 'hp-low';

  // Determine role from name (placeholder logic)
  const getRole = (): { label: string; color: string } | null => {
    const nameLower = card.name.toLowerCase();
    if (nameLower.includes('tank') || nameLower.includes('guardian') || nameLower.includes('paladin'))
      return { label: 'TANK', color: '#2196f3' };
    if (nameLower.includes('heal') || nameLower.includes('sage') || nameLower.includes('shaman') || nameLower.includes('support'))
      return { label: 'HEAL', color: '#4caf50' };
    if (nameLower.includes('assassin') || nameLower.includes('shadow'))
      return { label: 'ASSASSIN', color: '#9c27b0' };
    if (nameLower.includes('mage') || nameLower.includes('necro'))
      return { label: 'MAGE', color: '#ff9800' };
    return { label: 'DPS', color: '#f44336' };
  };

  const role = getRole();

  const classNames = [
    'champion-card',
    !isAlive && 'dead',
    isSelected && 'selected',
    isTargetable && 'targetable',
    showDamage && 'damage-flash',
    isHit && 'hit-flash',
    isAttacking && (isEnemy ? 'attacking-enemy' : 'attacking-player'),
  ].filter(Boolean).join(' ');

  return (
    <div ref={cardRef} className={classNames} onClick={isAlive ? onClick : undefined} onKeyDown={isAlive ? (e) => { if (e.key === 'Enter') onClick?.(); } : undefined} role="button" tabIndex={isAlive ? 0 : -1}>
      <div className="champion-top">
        {role && (
          <div className="champion-role" style={{ background: role.color, color: 'white' }}>
            {role.label}
          </div>
        )}
        <div className="champion-rarity-dot" style={{ background: rarityColor }} />

        {imageUrl ? (
          <div className="champion-avatar" style={{ 
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontSize: 0
          }}>
            {!isAlive && '💀'}
          </div>
        ) : (
          <div className="champion-avatar">
            {isAlive ? categoryIcon : '💀'}
          </div>
        )}
        <div className="champion-name">{card.name}</div>
        <div className="champion-category">{card.category}</div>
      </div>

      <div className="champion-hp-bar-container">
        <div className="champion-hp-bar-bg">
          <div
            className={`champion-hp-bar-fill ${hpClass}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="champion-hp-text">{Math.max(0, currentHP)}/{maxHP}</div>
      </div>

      <div className="champion-stats-row">
        <div className="stat-item">
          <span className="stat-icon">⚔️</span>
          <span className="stat-value">{card.stats.ATK}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🛡️</span>
          <span className="stat-value">{card.stats.DEF}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💨</span>
          <span className="stat-value">{card.stats.Esquive}</span>
        </div>
      </div>
    </div>
  );
};

export default ChampionCardComponent;
