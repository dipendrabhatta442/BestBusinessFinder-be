import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

declare global {
    namespace Express {
        interface Request {
            decoded?: { userId: string };
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
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }

        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
            req.decoded = { userId: (decoded as { id: string }).id };
        } else {
            res.status(403).json({ message: 'Forbidden: Token structure invalid' });
            return;
        }

        next();
    });
};

export default jwtMiddleware;
