import { Request, Response } from 'express';
import { CardsService } from './cards.service.js';

export class CardsController {
  private cardsService: CardsService;

  constructor() {
    this.cardsService = new CardsService();
  }

  getInvocatorCardById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cardId = parseInt(id, 10);

      if (isNaN(cardId)) {
        return res.status(400).json({ msg: 'Invalid card ID' });
      }

      const card = await this.cardsService.getInvocatorCardById(cardId);

      if (!card) {
        return res.status(404).json({ msg: 'Invocator card not found' });
      }

      card.image = `${req.protocol}://${req.get('host')}/invocator-card/${card.image}`;
      res.status(200).json(card);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getUnitCardById = async (req: Request, res: Response) => {
    try {
      const { parent_id, id } = req.params;
      const parentId = parseInt(parent_id, 10);
      const cardId = parseInt(id, 10);

      if (isNaN(parentId) || isNaN(cardId)) {
        return res.status(400).json({ msg: 'Invalid card ID or parent ID' });
      }

      let card = await this.cardsService.getUnitCardById(parentId, cardId);

      if (!card) {
        return res.status(404).json({ msg: 'Unit card not found' });
      }

      card.image = `${req.protocol}://${req.get('host')}/unit-card/${card.image}`;
      res.status(200).json({ ...card, parentId });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
