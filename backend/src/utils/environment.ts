import dotenv from 'dotenv';

dotenv.config();

export const ENV_VARS = {
    MONGODB_URI: process.env.MONGO_URI as string,
    MONGODB_NAME: process.env.MONGO_INITDB_DATABASE as string,
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string
};
