import fs from 'fs';
import path from 'path';
import { Card, CardRarity } from './gacha.types.js';
import { InventoryRepository } from '../inventory/inventory.repository.js';
import { Inventory } from '../../types/inventory.type.js';
import { GachaRepository } from './gacha.repository.js';
import { loadAllUnitCards } from '../../utils/cardLoader.js';

const DATA_PATH = path.join(process.cwd(), 'public', 'invocator-card', 'invocator-card.json');

function normalizeRarity(raw: string | undefined): CardRarity {
  const value = (raw ?? '').toLowerCase();
  if (value === 'commune' || value === 'common') return 'common';
  if (value === 'rare') return 'rare';
  if (value === 'epique' || value === 'epic') return 'epic';
  if (value === 'legendaire' || value === 'legendary') return 'legendary';
  return 'common';
}

function loadCards(): Card[] {
  const invocatorsRaw = fs.readFileSync(DATA_PATH, 'utf-8');
  const invocators = (JSON.parse(invocatorsRaw) as any[]).map((card) => ({
    ...card,
    cardType: 'summoner' as const,
    rarity: normalizeRarity(card.rarity),
  }));

  const units = loadAllUnitCards().map((card) => ({
    ...card,
    cardType: 'unit' as const,
    rarity: normalizeRarity(card.rarity),
  }));

  return [...invocators, ...units] as Card[];
}

const allCards = loadCards();
const cardsByRarity = {
  legendary: allCards.filter((c) => c.rarity === 'legendary'),
  epic: allCards.filter((c) => c.rarity === 'epic'),
  rare: allCards.filter((c) => c.rarity === 'rare'),
  common: allCards.filter((c) => c.rarity === 'common'),
};

const BASE_PROBS: Record<CardRarity, number> = {
  legendary: 1,
  epic: 9,
  rare: 30,
  common: 60,
};

export class GachaService {
  private inventoryRepo: InventoryRepository;
  private gachaRepo: GachaRepository;

  constructor() {
    this.inventoryRepo = new InventoryRepository();
    this.gachaRepo = new GachaRepository();
  }

  private flattenIds(value: unknown): number[] {
    if (Array.isArray(value)) {
      return value.flat(Infinity).filter((v) => typeof v === 'number') as number[];
    }
    if (typeof value === 'number') return [value];
    return [];
  }

  private cardKey(card: Card): string {
    return `${card.cardType}:${card.id}`;
  }

  private pickFromRarity(rarity: CardRarity, exclude: Set<string>): Card | null {
    const pool = cardsByRarity[rarity].filter((c) => !exclude.has(this.cardKey(c)));
    if (pool.length === 0) return null;
    const card = pool[Math.floor(Math.random() * pool.length)];
    exclude.add(this.cardKey(card));
    return card;
  }

  private pickAny(exclude: Set<string>): Card {
    const pool = allCards.filter((c) => !exclude.has(this.cardKey(c)));
    const card = (pool.length ? pool : allCards)[Math.floor(Math.random() * (pool.length ? pool.length : allCards.length))];
    exclude.add(this.cardKey(card));
    return card;
  }

  private rollRarity(): CardRarity {
    const roll = Math.random() * 100;
    let acc = 0;
    for (const rarity of ['legendary', 'epic', 'rare', 'common'] as CardRarity[]) {
      acc += BASE_PROBS[rarity];
      if (roll <= acc) return rarity;
    }
    return 'common';
  }

  private enforceGuarantees(pulls: Card[], count: 1 | 10, pityLegendaryReady: boolean, exclude: Set<string>) {
    if (pityLegendaryReady) {
      const legendary = this.pickFromRarity('legendary', exclude);
      if (legendary) pulls[0] = legendary;
    }
    if (count === 10) {
      // ensure at least 4 rares
      let rares = pulls.filter((c) => c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary').length;
      while (rares < 4) {
        const rare = this.pickFromRarity('rare', exclude);
        if (!rare) break;
        pulls[rares] = rare;
        rares++;
      }
      // ensure at least 1 epic
      if (!pulls.some((c) => c.rarity === 'epic' || c.rarity === 'legendary')) {
        const epic = this.pickFromRarity('epic', exclude);
        if (epic) pulls[pulls.length - 1] = epic;
      }
    }
    return pulls;
  }

  async pull(userId: string, count: 1 | 10) {
    const inv = await this.inventoryRepo.getInventory(userId);
    const ownedSummoners = this.flattenIds(inv?.summonerCards);
    const ownedUnits = this.flattenIds(inv?.unitCards);
    const currentTickets = typeof inv?.tickets === 'number' ? inv.tickets : 20;

    if (currentTickets < count) {
      const err = new Error('NOT_ENOUGH_TICKETS');
      throw err;
    }
    const ownedKeys = new Set<string>([
      ...ownedSummoners.map((id) => `summoner:${id}`),
      ...ownedUnits.map((id) => `unit:${id}`),
    ]);

    const available = allCards.filter((c) => !ownedKeys.has(this.cardKey(c)));
    if (available.length === 0) {
      return { pulls: [], remainingPool: 0, tickets: currentTickets };
    }

    const state = (await this.gachaRepo.getState(userId)) ?? { userId, pullsSinceLegendary: 0 };
    const pityReady = state.pullsSinceLegendary >= 79;

    const pulls: Card[] = [];
    const exclude = new Set<string>(ownedKeys);

    for (let i = 0; i < count && pulls.length < available.length; i++) {
      const rarity = this.rollRarity();
      const card =
        this.pickFromRarity(rarity, exclude) ??
        this.pickFromRarity('common', exclude) ??
        this.pickAny(exclude);
      if (card) pulls.push(card);
    }

    this.enforceGuarantees(pulls, count, pityReady, exclude);

    // update inventory with new cards
    const nextSummoners = new Set<number>(ownedSummoners);
    const nextUnits = new Set<number>(ownedUnits);

    for (const card of pulls) {
      if (card.cardType === 'summoner') {
        nextSummoners.add(card.id);
      } else if (card.cardType === 'unit') {
        nextUnits.add(card.id);
      }
    }

    const nextInventory: Inventory = {
      userId,
      summonerCards: Array.from(nextSummoners),
      unitCards: Array.from(nextUnits),
      activeCards: inv?.activeCards ?? [],
      tickets: currentTickets - count,
    };
    await this.inventoryRepo.updateInventory(userId, nextInventory);

    // update pity
    const pulledLegendary = pulls.some((c) => c.rarity === 'legendary');
    const newPity = pulledLegendary ? 0 : state.pullsSinceLegendary + count;
    await this.gachaRepo.saveState(userId, { userId, pullsSinceLegendary: newPity });

    const remainingPool = Math.max(0, allCards.length - (nextSummoners.size + nextUnits.size));
    return { pulls, remainingPool, tickets: nextInventory.tickets };
  }

  async getStatus(userId: string) {
    const inv = await this.inventoryRepo.getInventory(userId);
    const ownedSummoners = this.flattenIds(inv?.summonerCards);
    const ownedUnits = this.flattenIds(inv?.unitCards);
    const currentTickets = typeof inv?.tickets === 'number' ? inv.tickets : 20;
    const ownedKeys = new Set<string>([
      ...ownedSummoners.map((id) => `summoner:${id}`),
      ...ownedUnits.map((id) => `unit:${id}`),
    ]);
    const remainingPool = Math.max(0, allCards.length - ownedKeys.size);
    return {
      remainingPool,
      totalPool: allCards.length,
      ownedCount: ownedKeys.size,
      tickets: currentTickets,
    };
  }
}
