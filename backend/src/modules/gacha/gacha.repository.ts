import { Collection } from 'mongodb';
import { getCollection } from '../../config/db.js';
import { GachaState } from './gacha.types.js';

export class GachaRepository {
  private collection: Collection<GachaState>;

  constructor() {
    this.collection = getCollection<GachaState>('gacha_state');
  }

  async getState(userId: string) {
    return this.collection.findOne({ userId });
  }

  async saveState(userId: string, state: GachaState) {
    await this.collection.updateOne({ userId }, { $set: state }, { upsert: true });
  }
}
