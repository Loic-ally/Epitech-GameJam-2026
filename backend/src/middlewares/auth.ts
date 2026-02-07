import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../utils/environment.js';

export const verifyAccess = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header missing or malformed' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, ENV_VARS.JWT_ACCESS_TOKEN_SECRET);

        if (typeof decoded === 'object' && decoded._id) {
            req.body.user = { _id: decoded._id };
        } else {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
