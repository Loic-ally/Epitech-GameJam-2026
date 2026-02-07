import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';

const inventoryRouter = Router();
const inventoryController = new InventoryController();

inventoryRouter.put('/', (req, res) => inventoryController.addCard(req, res));
inventoryRouter.get('/', (req, res) => inventoryController.getInventory(req, res));

export { inventoryRouter };
