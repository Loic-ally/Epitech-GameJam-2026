import { InventoryRepository } from './inventory.repository.js';
import { Inventory } from '../../types/inventory.type.js';

export class InventoryService {
    private inventoryRepository: InventoryRepository;

    constructor() {
        this.inventoryRepository = new InventoryRepository();
    }

    async addCard(userId: string, cardId: number | number[], cardType: 'summonerCards' | 'unitCards' | 'activeCards') {
        const userInventory = await this.inventoryRepository.getInventory(userId);

        const normalize = (value: unknown): number[] => {
            if (Array.isArray(value)) {
                return value.flat(Infinity).filter((v) => typeof v === 'number') as number[];
            }
            if (typeof value === 'number') return [value];
            return [];
        };

        const inventory: Inventory = {
            userId: userId,
            summonerCards: normalize(userInventory?.summonerCards),
            unitCards: normalize(userInventory?.unitCards),
            activeCards: normalize(userInventory?.activeCards),
            tickets: typeof userInventory?.tickets === 'number' ? userInventory.tickets : 20,
        };

        const nextCards = normalize(inventory[cardType]);
        if (Array.isArray(cardId)) {
            nextCards.push(...cardId);
        } else {
            nextCards.push(cardId);
        }
        inventory[cardType] = nextCards;

        if (!userInventory) {
            await this.inventoryRepository.createInventory(inventory);
            return;
        }
        await this.inventoryRepository.updateInventory(userId, inventory);
    }

    async getInventory(userId: string): Promise<Inventory | null> {
        const inventory = await this.inventoryRepository.getInventory(userId);

        if (inventory && typeof inventory.tickets !== 'number') {
            inventory.tickets = 20;
            await this.inventoryRepository.updateInventory(userId, inventory);
        }

        return inventory;
    }

    async addTickets(userId: string, amount: number): Promise<number> {
        const userInventory = await this.inventoryRepository.getInventory(userId);
        const normalize = (value: unknown): number[] => {
            if (Array.isArray(value)) {
                return value.flat(Infinity).filter((v) => typeof v === 'number') as number[];
            }
            if (typeof value === 'number') return [value];
            return [];
        };

        const currentTickets = typeof userInventory?.tickets === 'number' ? userInventory.tickets : 20;
        const nextInventory: Inventory = {
            userId,
            summonerCards: normalize(userInventory?.summonerCards),
            unitCards: normalize(userInventory?.unitCards),
            activeCards: normalize(userInventory?.activeCards),
            tickets: currentTickets + amount,
        };

        await this.inventoryRepository.updateInventory(userId, nextInventory);
        return nextInventory.tickets;
    }
}
