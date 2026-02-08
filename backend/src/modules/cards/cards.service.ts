import fs from 'fs/promises';
import path from 'path';
import { InvocatorCard, UnitCard, UnitCardIndex } from '../../types/cards.types.js';

export class CardsService {
  private readonly publicPath = path.join(process.cwd(), 'public');
  private readonly invocatorCardsPath = path.join(this.publicPath, 'invocator-card', 'invocator-card.json');
  private readonly unitCardsIndexPath = path.join(this.publicPath, 'unit-card', 'index.json');
  private readonly unitCardsPath = path.join(this.publicPath, 'unit-card');

  async getInvocatorCardById(id: number): Promise<InvocatorCard | null> {
    try {
      const data = await fs.readFile(this.invocatorCardsPath, 'utf-8');
      const cards = JSON.parse(data) as InvocatorCard[];

      return cards.find(card => card.id === id) || null;
    } catch (error) {
      console.error('Error getting invocator card by ID:', error);
      return null;
    }
  }

  async getUnitCardById(parentId: number, cardId: number): Promise<UnitCard | null> {
    try {
      console.log(this.unitCardsIndexPath)
      const indexData = await fs.readFile(this.unitCardsIndexPath, 'utf-8');
      const index = JSON.parse(indexData) as UnitCardIndex[];
      console.log(index)
      const cardInfo = index.find(card => card.id === parentId);

      if (!cardInfo){
        return null;
      }

      const cardPath = path.join(this.unitCardsPath, cardInfo.name, `${cardInfo.name}.json`);
      const data = await fs.readFile(cardPath, 'utf-8');
      const cards = JSON.parse(data) as UnitCard[];

      return cards.find(card => card.id === cardId) || null;
    } catch (error) {
      console.error('Error getting unit card by ID:', error);
      return null;
    }
  }
}
