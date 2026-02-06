export interface Unity {
  id: string;
  basename: string;
  secondname?: string;
  rarity: string;
  type: string;

  passive?: string;
  firstSkill?: string;
  superAttack?: string;

  baseAttack?: number;
  mana?: number;
  hp?: number;
  atk?: number;
  def?: number;
  critPct?: number;
  dodgePct?: number;
  level?: number;
  description?: string;

  baseAttributes?: string[];
  specialAttributes?: string[];
}

type Inventory = Record<string, Unity[]>;

class CardsService {
  private store: Inventory = {};

  getInventory(userId: string): Unity[] {
    return this.store[userId] ?? [];
  }

  setInventory(userId: string, items: Unity[]): Unity[] {
    this.store[userId] = items;
    return this.store[userId];
  }

  validatePayload(payload: unknown): Unity[] {
    if (!Array.isArray(payload)) {
      throw new Error("Payload must be an array of Unitys.");
    }

    payload.forEach((item, index) => {
      const fail = (msg: string) =>
        new Error(`Invalid Unity at index ${index}: ${msg}`);

      if (typeof (item as any)?.id !== "string") throw fail("missing id");
      if (typeof (item as any)?.basename !== "string")
        throw fail("missing basename");
      if (
        (item as any)?.secondname !== undefined &&
        typeof (item as any).secondname !== "string"
      )
        throw fail("secondname must be string when provided");
      if (typeof (item as any)?.rarity !== "string") throw fail("missing rarity");
      if (typeof (item as any)?.type !== "string") throw fail("missing type");

      const isItem = (item as any).type.startsWith("item");
      const isCharacter = !isItem;

      if (isCharacter) {
        if (typeof (item as any)?.firstSkill !== "string")
          throw fail("missing firstSkill");
        if (typeof (item as any)?.passive !== "string")
          throw fail("missing passive");
        if (typeof (item as any)?.superAttack !== "string")
          throw fail("missing superAttack");
        if (typeof (item as any)?.baseAttack !== "number")
          throw fail("missing baseAttack");
        if (typeof (item as any)?.mana !== "number") throw fail("missing mana");
        if (typeof (item as any)?.hp !== "number") throw fail("missing hp");
        if (typeof (item as any)?.atk !== "number") throw fail("missing atk");
        if (typeof (item as any)?.def !== "number") throw fail("missing def");
        if (typeof (item as any)?.critPct !== "number")
          throw fail("missing critPct");
        if (typeof (item as any)?.dodgePct !== "number")
          throw fail("missing dodgePct");
        if (typeof (item as any)?.level !== "number") throw fail("missing level");
        if (typeof (item as any)?.description !== "string")
          throw fail("missing description");

        if (!this.isStringArrayMax((item as any)?.baseAttributes, 4))
          throw fail("baseAttributes must be array<string> up to 4 items");
      }

      if (isItem) {
        if (
          (item as any)?.passive !== undefined &&
          typeof (item as any).passive !== "string"
        )
          throw fail("passive must be string when provided");
        if (
          (item as any)?.activeSkill !== undefined &&
          typeof (item as any).activeSkill !== "string"
        )
          throw fail("activeSkill must be string when provided");
        if (
          (item as any)?.baseAttributes !== undefined &&
          !this.isStringArrayMax((item as any).baseAttributes, 4)
        ) {
          throw fail("baseAttributes must be array<string> up to 4 items");
        }
      }

      if (
        (item as any)?.specialAttributes !== undefined &&
        !this.isStringArrayMax((item as any).specialAttributes, 4)
      ) {
        throw fail("specialAttributes must be array<string> up to 4 items");
      }
    });

    return payload as Unity[];
  }

  private isStringArrayMax(arr: any, max: number) {
    return Array.isArray(arr) && arr.length <= max && arr.every(v => typeof v === "string");
  }
}

export const cardsService = new CardsService();
