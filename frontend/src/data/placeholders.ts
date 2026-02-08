import { InvocatorCard, HandCard, ChampionInBattle } from '../types/battle.type';

// ─── Placeholder Invocator Cards ────────────────────────────────────────
export const PLACEHOLDER_INVOCATOR_PLAYER: InvocatorCard = {
  id: 1,
  name: 'Your Summoner',
  rarity: 'legendaire',
  promo: 'tek2',
  image: '',
  leader_skill: {
    type: 'stat_boost',
    target: 'all',
    stats: [{ stat: 'ATK', value: 20, unit: 'percent' }],
  },
};

export const PLACEHOLDER_INVOCATOR_ENEMY: InvocatorCard = {
  id: 2,
  name: 'Enemy Summoner',
  rarity: 'epique',
  promo: 'tek3',
  image: '',
  leader_skill: {
    type: 'stat_boost',
    target: 'all',
    stats: [{ stat: 'DEF', value: 15, unit: 'percent' }],
  },
};

// ─── Placeholder Unit Cards ─────────────────────────────────────────────
const makeChampion = (id: number, name: string, category: string, rarity: string, hp: number, atk: number, def: number): ChampionInBattle => ({
  card: {
    id,
    name,
    image: '',
    rarity,
    type: 'Technique',
    category,
    bio: `A mighty ${category} warrior.`,
    attributes: ['tek2'],
    stats: { HP: hp, ATK: atk, DEF: def, Esquive: 10, Critique: 5 },
  },
  currentHP: hp,
  maxHP: hp,
  isAlive: true,
  position: id - 1,
});

export const PLACEHOLDER_PLAYER_CHAMPIONS: ChampionInBattle[] = [
  makeChampion(1, 'DPS Warrior', 'LOL', 'rare', 80, 30, 10),
  makeChampion(2, 'Tank Guardian', 'CSGO', 'epique', 150, 15, 35),
  makeChampion(3, 'Healer Sage', 'WANKUL', 'rare', 90, 10, 20),
  makeChampion(4, 'Assassin Shadow', 'GAMBLING', 'legendaire', 70, 40, 5),
  makeChampion(5, 'Mage Fire', 'LOL', 'commune', 85, 25, 15),
  makeChampion(6, 'Support Wind', 'CSGO', 'rare', 95, 12, 25),
];

export const PLACEHOLDER_ENEMY_CHAMPIONS: ChampionInBattle[] = [
  makeChampion(1, 'Dark Knight', 'LOL', 'epique', 120, 25, 30),
  makeChampion(2, 'Berserker', 'CSGO', 'rare', 100, 35, 10),
  makeChampion(3, 'Necromancer', 'GAMBLING', 'legendaire', 75, 30, 15),
  makeChampion(4, 'Paladin', 'WANKUL', 'rare', 130, 15, 30),
  makeChampion(5, 'Ranger', 'LOL', 'commune', 85, 28, 12),
  makeChampion(6, 'Shaman', 'CSGO', 'epique', 90, 20, 22),
];

// ─── Placeholder Hand Cards ─────────────────────────────────────────────
export const PLACEHOLDER_HAND_CARDS: HandCard[] = [
  { id: 1, value: 20, type: 'buff_ATK', name: 'Power Surge', description: '+20 ATK to one champion' },
  { id: 2, value: 15, type: 'heal', name: 'Healing Light', description: 'Restore 15 HP' },
  { id: 3, value: 25, type: 'damage', name: 'Fire Bolt', description: 'Deal 25 damage' },
  { id: 4, value: 10, type: 'buff_DEF', name: 'Iron Wall', description: '+10 DEF to one champion' },
  { id: 5, value: 30, type: 'special', name: 'Ultimate Strike', description: 'Deal 30 damage, ignore DEF' },
];

// ─── Rarity Colors ──────────────────────────────────────────────────────
export const RARITY_COLORS: Record<string, string> = {
  commune: '#9e9e9e',
  rare: '#2196f3',
  epique: '#9c27b0',
  legendaire: '#ff9800',
};

export const RARITY_GRADIENTS: Record<string, string> = {
  commune: 'linear-gradient(135deg, #616161, #9e9e9e)',
  rare: 'linear-gradient(135deg, #1565c0, #42a5f5)',
  epique: 'linear-gradient(135deg, #6a1b9a, #ce93d8)',
  legendaire: 'linear-gradient(135deg, #e65100, #ffb74d)',
};

export const CATEGORY_ICONS: Record<string, string> = {
  LOL: '🎮',
  CSGO: '🔫',
  GAMBLING: '🎰',
  WANKUL: '🃏',
};

export const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  DPS: { label: 'DPS', color: '#f44336' },
  TANK: { label: 'TANK', color: '#2196f3' },
  HEAL: { label: 'HEAL', color: '#4caf50' },
  ASSASSIN: { label: 'ASSASSIN', color: '#9c27b0' },
  MAGE: { label: 'MAGE', color: '#ff9800' },
  SUPPORT: { label: 'SUPPORT', color: '#00bcd4' },
};
