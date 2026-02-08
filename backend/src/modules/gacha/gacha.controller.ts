import { Request, Response } from 'express';
import { GachaService } from './gacha.service.js';

export class GachaController {
  private service: GachaService;

  constructor() {
    this.service = new GachaService();
  }

  async pull(req: Request, res: Response) {
    try {
      const { user } = req.body;
      const count = Number(req.body.count) === 10 ? 10 : 1;
      const result = await this.service.pull(user._id, count as 1 | 10);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_ENOUGH_TICKETS') {
        return res.status(400).json({ msg: 'Not enough tickets' });
      }
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  }

  async status(req: Request, res: Response) {
    try {
      const { user } = req.body;
      const result = await this.service.getStatus(user._id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  }
}
