export interface Stats {
  HP: number;
  ATK: number;
  DEF: number;
  Esquive: number;
  Critique: number;
}

export interface LeaderSkill {
  type: string;
  target: string;
  stats: {
    stat: string;
    value: number;
    unit: string;
  }[];
}
export interface InvocatorCard {
  id: number;
  name: string;
  rarity: string;
  promo: string;
  image: string;
  leader_skill: LeaderSkill;
}

export interface UnitCard {
  id: number;
  name: string;
  image: string;
  rarity: string;
  type: string;
  bio: string;
  attributes: string[];
  stats: Stats;
}

export interface UnitCardIndex {
  name: string;
  id: number;
}
