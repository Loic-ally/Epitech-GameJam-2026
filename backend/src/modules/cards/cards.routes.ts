import { Router } from 'express';
import { CardsController } from './cards.controller.js';

const cardsRouter = Router();
const cardsController = new CardsController();

cardsRouter.get('/invocator/:id', cardsController.getInvocatorCardById);
cardsRouter.get('/unit/:parent_id/:id', cardsController.getUnitCardById);

export { cardsRouter };
