import crypto from "crypto";

export interface Summoner {
  id: string;
  userId: string;
  name: string;
  rarity: string;
  image: string;
  leaderskill: string;
}

class SummonerService {
  private store = new Map<string, Summoner>();

  create(userId: string, name: string): Summoner {
    const existing = this.store.get(userId);
    if (existing) return existing;

    const summoner: Summoner = {
      id: crypto.randomUUID(),
      userId,
      name,
      rarity: "common",
      image: "",
      leaderskill: "",
    };
    this.store.set(userId, summoner);
    return summoner;
  }

  getByUser(userId: string): Summoner | undefined {
    return this.store.get(userId);
  }

  rename(userId: string, name: string): Summoner {
    const summoner = this.store.get(userId);
    if (!summoner) throw new Error("Summoner not found");
    summoner.name = name;
    return summoner;
  }
}

export const summonerService = new SummonerService();
