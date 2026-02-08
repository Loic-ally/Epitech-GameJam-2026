import { InventoryRepository } from './inventory.repository.js';
import { Inventory } from '../../types/inventory.type.js';

export class InventoryService {
    private inventoryRepository: InventoryRepository;

    constructor() {
        this.inventoryRepository = new InventoryRepository();
    }

    async addCard(userId: string, cardId: number, cardType: 'summonerCards' | 'unitCards' | 'activeCards') {
        const userInventory = await this.inventoryRepository.getInventory(userId);

        const inventory: Inventory = {
            userId: userId,
            summonerCards: [],
            unitCards: [],
            activeCards: [],
        }
        inventory[cardType].push(cardId);

        if (!userInventory) {
            await this.inventoryRepository.createInventory(inventory);
            return;
        }
        await this.inventoryRepository.updateInventory(userId, inventory);
    }

    async getInventory(userId: string): Promise<Inventory | null> {
        const inventory = await this.inventoryRepository.getInventory(userId);

        return inventory;
    }
}
