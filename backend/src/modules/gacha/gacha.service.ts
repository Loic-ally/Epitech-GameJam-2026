import fs from 'fs';
import path from 'path';
import { Card, CardRarity } from './gacha.types.js';
import { InventoryRepository } from '../inventory/inventory.repository.js';
import { Inventory } from '../../types/inventory.type.js';
import { GachaRepository } from './gacha.repository.js';

const DATA_PATH = path.join(process.cwd(), 'public', 'invocator-card', 'invocator-card.json');

function loadCards(): Card[] {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Card[];
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

  private pickFromRarity(rarity: CardRarity, exclude: Set<number>): Card | null {
    const pool = cardsByRarity[rarity].filter((c) => !exclude.has(c.id));
    if (pool.length === 0) return null;
    const card = pool[Math.floor(Math.random() * pool.length)];
    exclude.add(card.id);
    return card;
  }

  private pickAny(exclude: Set<number>): Card {
    const pool = allCards.filter((c) => !exclude.has(c.id));
    const card = (pool.length ? pool : allCards)[Math.floor(Math.random() * (pool.length ? pool.length : allCards.length))];
    exclude.add(card.id);
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

  private enforceGuarantees(pulls: Card[], count: 1 | 10, pityLegendaryReady: boolean, exclude: Set<number>) {
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
    const owned = new Set<number>([
      ...(inv?.summonerCards ?? []),
      ...(inv?.unitCards ?? []),
      ...(inv?.activeCards ?? []),
    ]);

    const available = allCards.filter((c) => !owned.has(c.id));
    if (available.length === 0) {
      return { pulls: [], remainingPool: 0 };
    }

    const state = (await this.gachaRepo.getState(userId)) ?? { userId, pullsSinceLegendary: 0 };
    const pityReady = state.pullsSinceLegendary >= 79;

    const pulls: Card[] = [];
    const exclude = new Set<number>(owned);

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
    const newIds = pulls.map((c) => c.id);
    const nextInventory: Inventory = {
      userId,
      summonerCards: inv?.summonerCards ?? [],
      unitCards: Array.from(new Set([...(inv?.unitCards ?? []), ...newIds])),
      activeCards: inv?.activeCards ?? [],
    };
    await this.inventoryRepo.updateInventory(userId, nextInventory);

    // update pity
    const pulledLegendary = pulls.some((c) => c.rarity === 'legendary');
    const newPity = pulledLegendary ? 0 : state.pullsSinceLegendary + count;
    await this.gachaRepo.saveState(userId, { userId, pullsSinceLegendary: newPity });

    const remainingPool = Math.max(0, allCards.length - nextInventory.unitCards.length);
    return { pulls, remainingPool };
  }
}
