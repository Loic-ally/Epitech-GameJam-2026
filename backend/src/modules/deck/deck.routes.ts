import { Router } from 'express';
import { DeckController } from './deck.controller.js';

const deckRouter = Router();
const deckController = new DeckController();

deckRouter.put('/', (req, res) => deckController.changeDeck(req, res));
deckRouter.get('/', (req, res) => deckController.getDeck(req, res));

export { deckRouter };
