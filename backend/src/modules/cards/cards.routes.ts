import { Router } from 'express';
import { CardsController } from './cards.controller.js';

const cardsRouter = Router();
const cardsController = new CardsController();

cardsRouter.get('/', (req, res) => cardsController.getAll(req, res));

export { cardsRouter };
