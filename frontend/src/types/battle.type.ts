export interface CardStats {
  HP: number;
  ATK: number;
  DEF: number;
  Esquive: number;
  Critique: number;
}

export interface UnitCard {
  id: number;
  name: string;
  image: string;
  rarity: string;
  type: string;
  category: string;
  bio: string;
  attributes: string[];
  stats: CardStats;
}

export interface LeaderSkill {
  type: string;
  target?: string;
  stats?: { stat: string; value: number; unit: string }[];
  condition?: { attribute: string };
  boost?: { stat: string; value: number; unit: string };
  penalty?: { stat: string; value: number; unit: string };
  card_type?: string;
  quantity?: number;
}

export interface InvocatorCard {
  id: number;
  name: string;
  rarity: string;
  promo: string;
  image: string;
  leader_skill: LeaderSkill;
}

export interface BattlePlayer {
  sessionId: string;
  displayName: string;
  invocator: InvocatorCard;
  champions: ChampionInBattle[];
}

export interface ChampionInBattle {
  card: UnitCard;
  currentHP: number;
  maxHP: number;
  isAlive: boolean;
  position: number; // 0-5
}

export type BattlePhase = 'waiting' | 'starting' | 'draw' | 'play' | 'attack' | 'ended';

export interface HandCard {
  id: number;
  value: number;
  type: 'buff_ATK' | 'buff_DEF' | 'heal' | 'damage' | 'special';
  name: string;
  description: string;
}

export interface DuelRequest {
  challengerId: string;
  challengerName: string;
  duelId: string;
}
