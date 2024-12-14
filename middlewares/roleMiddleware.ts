import { Request, Response, NextFunction } from 'express';

const roleMiddleware = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.decoded?.role; // Assuming role is stored in JWT payload

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

export default roleMiddleware;
