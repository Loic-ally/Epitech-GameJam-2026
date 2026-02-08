import React from 'react';
import { InvocatorCard } from '../../types/battle.type';
import { RARITY_GRADIENTS, RARITY_COLORS } from '../../data/placeholders';

interface SummonerCardProps {
  invocator: InvocatorCard;
  isEnemy?: boolean;
  assetBaseUrl?: string;
}

const SummonerCardComponent: React.FC<SummonerCardProps> = ({ invocator, isEnemy, assetBaseUrl }) => {
  const gradient = RARITY_GRADIENTS[invocator.rarity] || RARITY_GRADIENTS.commune;
  const rarityColor = RARITY_COLORS[invocator.rarity] || RARITY_COLORS.commune;
  const baseUrl = assetBaseUrl ?? '';
  const imageUrl = invocator.image ? `${baseUrl}/invocator-card/${invocator.image}` : '';

  const getSkillDescription = () => {
    const skill = invocator.leader_skill;
    switch (skill.type) {
      case 'stat_boost':
        return skill.stats?.map(s => `+${s.value}% ${s.stat}`).join(', ') || 'Boost';
      case 'stat_boost_conditional':
        return `${skill.stats?.map(s => `+${s.value}% ${s.stat}`).join(', ')} (if ${skill.condition?.attribute})`;
      case 'starting_cards':
        return `Start with ${skill.quantity} ${skill.card_type} card(s)`;
      default:
        return 'Leader Skill';
    }
  };

  return (
    <div className="summoner-area">
      <div
        className="summoner-card"
        style={{ background: gradient }}
        title={`${invocator.name} — ${getSkillDescription()}`}
      >
        <div
          className="rarity-badge"
          style={{ color: rarityColor }}
        >
          {invocator.rarity.toUpperCase()}
        </div>
        {imageUrl ? (
          <div className="summoner-avatar" style={{ 
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        ) : (
          <div className="summoner-avatar">
            {isEnemy ? '👹' : '🧙'}
          </div>
        )}
        <div className="summoner-name">{invocator.name}</div>
        <div className="summoner-skill">{getSkillDescription()}</div>
      </div>
      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {isEnemy ? 'Enemy' : 'Your'} Summoner
      </div>
    </div>
  );
};

export default SummonerCardComponent;
