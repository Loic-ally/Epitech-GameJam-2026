import { getCollection } from '../../config/db.js';
import { Deck } from '../../types/deck.type.js';

export class DeckRepository {
    private collection = getCollection<Deck>('decks');

    async createDeck(deck: Deck) {
        await this.collection.insertOne(deck);
    }

    async getDeck(userId: string): Promise<Deck | null> {
        console.log(userId);
        return this.collection.findOne({ userId });
    }

    async updateDeck(userId: string, deck: Deck): Promise<void> {
        await this.collection.updateOne(
            { userId },
            { $set: deck },
            { upsert: true }
        );
    }
}
