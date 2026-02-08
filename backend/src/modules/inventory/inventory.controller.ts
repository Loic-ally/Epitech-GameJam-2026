import { Request, Response } from 'express';
import { InventoryService } from './inventory.service.js';
import { Inventory } from '../../types/inventory.type.js';

export class InventoryController {
    private inventoryService: InventoryService;

    constructor() {
        this.inventoryService = new InventoryService();
    }

    async addCard(req: Request, res: Response) {
        try {
            const { user, cardId, cardType } = req.body;
            await this.inventoryService.addCard(user._id, cardId, cardType);

            res.status(200).json({ msg: 'Card added successfully' });
        } catch (error) {
            res.status(500).json({ msg: 'Internal server error' });
        }
    }

    async getInventory(req: Request, res: Response) {
        try {
            const { user } = req.body;
            const inventory: Inventory | null = await this.inventoryService.getInventory(user._id);

            if (!inventory) {
                return res.status(404).json({ msg: 'Inventory not found' });
            }
            res.status(200).json(inventory);
        } catch (error) {
            res.status(500).json({ msg: 'Internal server error' });
        }
    }
}
