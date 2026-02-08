import dotenv from 'dotenv';

dotenv.config();

const fallbackDbName = process.env.MONGO_INITDB_DATABASE ?? 'gamejam';
const fallbackUri = `mongodb://mongodb:27017/${fallbackDbName}`;
const fallbackJwt = process.env.JWT_ACCESS_TOKEN_SECRET ?? 'dev-secret-change-me';

export const ENV_VARS = {
    MONGODB_URI: (process.env.MONGO_URI ?? fallbackUri) as string,
    MONGODB_NAME: fallbackDbName,
    JWT_ACCESS_TOKEN_SECRET: fallbackJwt,
};
