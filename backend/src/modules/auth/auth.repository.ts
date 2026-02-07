import { Collection } from 'mongodb';
import { getCollection } from '../../config/db.js';
import { User } from '../../types/user.type.js';

export class AuthRepository {
    private collection: Collection<User>;

    constructor() {
        this.collection = getCollection<User>('users');
    }

    async createUser(user: User) {
        return await this.collection.insertOne(user);
    }

    async findUserByEmail(email: string) {
        return await this.collection.findOne({ email });
    }
}
