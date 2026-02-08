import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CardStats {
  HP: number;
  ATK: number;
  DEF: number;
  Esquive: number;
  Critique: number;
}

export interface UnitCardData {
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

export interface LeaderSkillData {
  type: string;
  target?: string;
  stats?: { stat: string; value: number; unit: string }[];
  condition?: { attribute: string };
  card_type?: string;
  quantity?: number;
}

export interface InvocatorCardData {
  id: number;
  name: string;
  rarity: string;
  promo: string;
  image: string;
  leader_skill: LeaderSkillData;
}

export interface HandCardData {
  id: number;
  name: string;
  type: string;
  value: number;
  description: string;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function makeUnitId(folderName: string, localId: number, usedIds: Set<number>): number {
  const prefix = hashString(folderName) % 1000000;
  let candidate = prefix * 1000 + localId;
  while (usedIds.has(candidate)) {
    candidate += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

// Load all unit cards from the public/unit-card directory
export function loadAllUnitCards(): UnitCardData[] {
  const cardsDir = path.join(__dirname, '../../public/unit-card');
  const allCards: UnitCardData[] = [];
  const usedIds = new Set<number>();
  
  try {
    const entries = fs.readdirSync(cardsDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const cardFile = path.join(cardsDir, entry.name, `${entry.name}.json`);
        if (fs.existsSync(cardFile)) {
          const content = fs.readFileSync(cardFile, 'utf-8');
          const cards = JSON.parse(content);
          if (Array.isArray(cards)) {
            for (const card of cards) {
              if (card && typeof card.id === 'number') {
                card.id = makeUnitId(entry.name, card.id, usedIds);
              }
              allCards.push(card);
            }
          }
        }
      }
    }
    
    // Filter out cards with 0 stats
    return allCards.filter(card => 
      card.stats && card.stats.HP > 0
    );
  } catch (err) {
    console.error('Error loading unit cards:', err);
    return [];
  }
}

// Load all invocator cards
export function loadAllInvocatorCards(): InvocatorCardData[] {
  const invocatorFile = path.join(__dirname, '../../public/invocator-card/invocator-card.json');
  
  try {
    if (fs.existsSync(invocatorFile)) {
      const content = fs.readFileSync(invocatorFile, 'utf-8');
      const cards = JSON.parse(content);
      return Array.isArray(cards) ? cards : [];
    }
  } catch (err) {
    console.error('Error loading invocator cards:', err);
  }
  
  return [];
}

// Generate hand cards (placeholders for now)
export function generateHandCardDeck(): HandCardData[] {
  return [
    { id: 1, name: 'Power Surge', type: 'buff_ATK', value: 15, description: '+15 ATK to target unit' },
    { id: 2, name: 'Iron Shield', type: 'buff_DEF', value: 10, description: '+10 DEF to target unit' },
    { id: 3, name: 'Healing Touch', type: 'heal', value: 20, description: 'Restore 20 HP to target unit' },
    { id: 4, name: 'Fire Bolt', type: 'damage', value: 25, description: 'Deal 25 damage to target enemy' },
    { id: 5, name: 'Quick Strike', type: 'buff_ATK', value: 10, description: '+10 ATK to target unit' },
    { id: 6, name: 'Barrier', type: 'buff_DEF', value: 15, description: '+15 DEF to target unit' },
    { id: 7, name: 'Life Drain', type: 'special', value: 20, description: 'Deal 20 damage and heal 10 HP' },
    { id: 8, name: 'Berserker Rage', type: 'buff_ATK', value: 25, description: '+25 ATK to target unit' },
    { id: 9, name: 'Mass Heal', type: 'heal', value: 15, description: 'Restore 15 HP to all units' },
    { id: 10, name: 'Lightning Strike', type: 'damage', value: 30, description: 'Deal 30 damage to target enemy' },
    { id: 11, name: 'Stone Skin', type: 'buff_DEF', value: 20, description: '+20 DEF to target unit' },
    { id: 12, name: 'Critical Focus', type: 'buff_ATK', value: 20, description: '+20 ATK to target unit' },
    { id: 13, name: 'Regeneration', type: 'heal', value: 25, description: 'Restore 25 HP to target unit' },
    { id: 14, name: 'Fireball', type: 'damage', value: 35, description: 'Deal 35 damage to target enemy' },
    { id: 15, name: 'Divine Protection', type: 'buff_DEF', value: 25, description: '+25 DEF to target unit' },
  ];
}

// Select random cards from deck
export function drawRandomCards(deck: HandCardData[], count: number): HandCardData[] {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get random units for a player
export function getRandomUnits(allUnits: UnitCardData[], count: number): UnitCardData[] {
  if (allUnits.length === 0) {
    // Fallback placeholder units
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Warrior ${i + 1}`,
      image: '',
      rarity: 'commune',
      type: 'Technique',
      category: 'Default',
      bio: 'A brave fighter',
      attributes: ['fighter'],
      stats: { HP: 80, ATK: 20, DEF: 15, Esquive: 10, Critique: 5 }
    }));
  }
  
  const shuffled = [...allUnits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get random invocator
export function getRandomInvocator(allInvocators: InvocatorCardData[]): InvocatorCardData {
  if (allInvocators.length === 0) {
    // Fallback placeholder
    return {
      id: 1,
      name: 'Default Summoner',
      rarity: 'commune',
      promo: 'tek2',
      image: '',
      leader_skill: {
        type: 'stat_boost',
        target: 'all',
        stats: [{ stat: 'ATK', value: 10, unit: 'percent' }]
      }
    };
  }
  
  return allInvocators[Math.floor(Math.random() * allInvocators.length)];
}
