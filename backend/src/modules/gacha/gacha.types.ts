export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardType = 'summoner' | 'unit';

export interface Card {
  id: number;
  name?: string;
  rarity: CardRarity;
  cardType: CardType;
  [key: string]: any;
}

export interface GachaState {
  userId: string;
  pullsSinceLegendary: number;
}
