import { Router } from 'express';
import { GachaController } from './gacha.controller.js';

const gachaRouter = Router();
const controller = new GachaController();

gachaRouter.post('/pull', (req, res) => controller.pull(req, res));

export { gachaRouter };
