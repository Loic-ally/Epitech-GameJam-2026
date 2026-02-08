import { Collection, InsertOneResult } from 'mongodb';
import { getCollection } from '../../config/db.js';
import { Inventory } from '../../types/inventory.type.js';

export class InventoryRepository {
    private collection: Collection<Inventory>;

    constructor() {
        this.collection = getCollection<Inventory>('inventories');
    }

    async createInventory(inventory: Inventory): Promise<InsertOneResult> {
        return await this.collection.insertOne(inventory);
    }

    async getInventory(userId: string): Promise<Inventory | null> {
        return await this.collection.findOne({ userId });
    }

    async updateInventory(userId: string, inventory: Inventory): Promise<void> {
        await this.collection.updateOne(
            { userId },
            { $set: inventory },
            { upsert: true }
        );
    }
}
