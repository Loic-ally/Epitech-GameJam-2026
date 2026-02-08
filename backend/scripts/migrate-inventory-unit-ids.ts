import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCollection } from '../src/config/db.js';

type InventoryDoc = {
  _id: any;
  userId: string;
  unitCards?: number[] | number[][];
  summonerCards?: number[] | number[][];
  activeCards?: number[] | number[][];
};

type DeckDoc = {
  _id: any;
  userId: string;
  unitCards?: number[] | number[][];
  summonerCards?: number;
  activeCards?: number[] | number[][];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UNIT_DIR = path.join(__dirname, '..', 'public', 'unit-card');
const INVOCATOR_PATH = path.join(__dirname, '..', 'public', 'invocator-card', 'invocator-card.json');

type LegacyMap = Map<number, number[]>;
type InvocatorSet = Set<number>;

function flattenIds(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.flat(Infinity).filter((v) => typeof v === 'number') as number[];
  }
  if (typeof value === 'number') return [value];
  return [];
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

function buildLegacyMap(): LegacyMap {
  const usedIds = new Set<number>();
  const legacyMap: LegacyMap = new Map();

  const entries = fs.readdirSync(UNIT_DIR, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const cardFile = path.join(UNIT_DIR, entry.name, `${entry.name}.json`);
    if (!fs.existsSync(cardFile)) continue;

    const content = fs.readFileSync(cardFile, 'utf-8');
    const cards = JSON.parse(content);
    if (!Array.isArray(cards)) continue;

    for (const card of cards) {
      if (!card || typeof card.id !== 'number') continue;
      const legacyId = card.id as number;
      const newId = makeUnitId(entry.name, legacyId, usedIds);
      const list = legacyMap.get(legacyId) ?? [];
      list.push(newId);
      legacyMap.set(legacyId, list);
    }
  }

  return legacyMap;
}

function loadInvocatorIds(): InvocatorSet {
  const content = fs.readFileSync(INVOCATOR_PATH, 'utf-8');
  const data = JSON.parse(content);
  const ids = new Set<number>();
  if (Array.isArray(data)) {
    for (const card of data) {
      if (card && typeof card.id === 'number') {
        ids.add(card.id);
      }
    }
  }
  return ids;
}

function mapUnitIds(
  legacyIds: number[],
  legacyMap: LegacyMap,
  userMap: Map<number, number>
): number[] {
  const mapped: number[] = [];
  for (const legacy of legacyIds) {
    if (userMap.has(legacy)) {
      mapped.push(userMap.get(legacy) as number);
      continue;
    }
    const candidates = legacyMap.get(legacy) ?? [];
    const chosen = candidates[0];
    if (typeof chosen === 'number') {
      userMap.set(legacy, chosen);
      mapped.push(chosen);
    } else {
      mapped.push(legacy);
    }
  }
  return mapped;
}

async function run() {
  const legacyMap = buildLegacyMap();
  const invocatorIds = loadInvocatorIds();
  const inventories = getCollection<InventoryDoc>('inventories');
  const decks = getCollection<DeckDoc>('decks');

  const mappingByUser = new Map<string, Map<number, number>>();

  const invCursor = inventories.find({});
  let invUpdated = 0;

  for await (const inv of invCursor) {
    const legacyIds = flattenIds(inv.unitCards);
    const existingSummoners = flattenIds(inv.summonerCards);
    const summonerFromUnits = legacyIds.filter((id) => invocatorIds.has(id));
    const unitLegacyIds = legacyIds.filter((id) => !invocatorIds.has(id));
    const userMap = mappingByUser.get(inv.userId) ?? new Map<number, number>();
    const nextUnitIds = mapUnitIds(unitLegacyIds, legacyMap, userMap);
    const nextSummoners = Array.from(new Set<number>([...existingSummoners, ...summonerFromUnits]));

    mappingByUser.set(inv.userId, userMap);

    await inventories.updateOne(
      { _id: inv._id },
      { $set: { unitCards: nextUnitIds, summonerCards: nextSummoners } }
    );
    invUpdated += 1;
  }

  const deckCursor = decks.find({});
  let deckUpdated = 0;

  for await (const deck of deckCursor) {
    const legacyIds = flattenIds(deck.unitCards);
    const summonerFromUnits = legacyIds.filter((id) => invocatorIds.has(id));
    const unitLegacyIds = legacyIds.filter((id) => !invocatorIds.has(id));
    const userMap = mappingByUser.get(deck.userId) ?? new Map<number, number>();
    const nextUnitIds = mapUnitIds(unitLegacyIds, legacyMap, userMap);
    mappingByUser.set(deck.userId, userMap);

    const existingSummoner = typeof deck.summonerCards === 'number' ? deck.summonerCards : undefined;
    const nextSummoner = (existingSummoner && invocatorIds.has(existingSummoner)) ? existingSummoner : summonerFromUnits[0];

    await decks.updateOne(
      { _id: deck._id },
      { $set: { unitCards: [nextUnitIds], summonerCards: nextSummoner } }
    );
    deckUpdated += 1;
  }

  console.log(`Updated inventories: ${invUpdated}`);
  console.log(`Updated decks: ${deckUpdated}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
