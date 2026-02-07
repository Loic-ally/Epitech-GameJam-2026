import { Request, Response } from 'express';
import { DeckService } from './deck.service.js';

export class DeckController {
    private deckService: DeckService;

    constructor() {
        this.deckService = new DeckService();
    }

    async changeDeck(req: Request, res: Response) {
        try {
            const { user, summonerCards, unitCards, activeCards } = req.body;
            await this.deckService.changeDeck(user._id, summonerCards, unitCards, activeCards);

            res.status(200).json({ msg: 'Deck updated successfully' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ msg: 'Internal server error' });
        }
    }

    async getDeck(req: Request, res: Response) {
        try {
            const { user } = req.body;
            const deck = await this.deckService.getDeck(user._id);

            if (!deck) {
                return res.status(404).json({ msg: 'Deck not found' });
            }
            res.status(200).json(deck);
        } catch (error) {
            res.status(500).json({ msg: 'Internal server error' });
        }
    }
}
