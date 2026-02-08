import { Request, Response } from 'express';
import { loadAllInvocatorCards, loadAllUnitCards } from '../../utils/cardLoader.js';

export class CardsController {
  async getAll(_req: Request, res: Response) {
    try {
      const invocators = loadAllInvocatorCards();
      const units = loadAllUnitCards();
      res.status(200).json({ invocators, units });
    } catch (error) {
      res.status(500).json({ msg: 'Failed to load cards' });
    }
  }
}
