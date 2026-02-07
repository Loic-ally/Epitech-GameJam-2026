import { MongoClient, Db, type Document } from 'mongodb';
import { ENV_VARS } from '../utils/environment.js';

const client: MongoClient = new MongoClient(ENV_VARS.MONGODB_URI as string);

let db: Db;

async function connectToDatabase() {
    await client.connect();
    db = client.db(ENV_VARS.MONGODB_NAME);
}

function getCollection<T extends Document = Document>(name: string) {
    return db.collection<T>(name);
}

if (!db) {
    await connectToDatabase();
}

export { connectToDatabase, getCollection };
