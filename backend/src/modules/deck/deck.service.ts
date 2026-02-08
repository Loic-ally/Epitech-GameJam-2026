import { DeckRepository } from './deck.repository.js';
import { Deck } from '../../types/deck.type.js';

export class DeckService {
    private deckRepository: DeckRepository;

    constructor() {
        this.deckRepository = new DeckRepository();
    }

    async changeDeck(userId: string, summonerCards: number, unitCards: number[][], activeCards: number[][]) {
        const userDeck = await this.deckRepository.getDeck(userId);
        const deck = {
            userId,
            summonerCards,
            unitCards,
            activeCards
        };

        if (!userDeck) {
            await this.deckRepository.createDeck(deck);
            return;
        }
        await this.deckRepository.updateDeck(userId, deck);
    }

    async getDeck(userId: string): Promise<Deck | null> {
        const deck = await this.deckRepository.getDeck(userId);

        return deck;
    }
}
