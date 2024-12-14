import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken';
import { config } from '../config/environment';

const JWT_SECRET = config.jwtSecret;

declare global {
    namespace Express {
        interface Request {
            decoded?: { userId: string, role: 'Admin' | 'BusinessUser' };
        }
    }
}

const jwtMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
        res.status(403).json({ message: 'Forbidden: Token is invalidated' });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification failed:", err);
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }


        if (typeof decoded === 'object' && 'id' in decoded && 'role' in decoded) {
            req.decoded = { userId: decoded.id, role: decoded.role };
        } else {
            res.status(403).json({ message: 'Forbidden: Token structure invalid' });
        }

        next();
    });
};

export default jwtMiddleware;
