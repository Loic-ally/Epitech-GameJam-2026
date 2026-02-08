export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: number;
  name?: string;
  rarity: CardRarity;
  [key: string]: any;
}

export interface GachaState {
  userId: string;
  pullsSinceLegendary: number;
}
