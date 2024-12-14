import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createHmac } from 'crypto';
import { config } from '../config/environment';

const APP_SECRET_KEY = config.appSecretKey;
const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Retrieve x-api-key header
        const apiKeyHeader = req.headers['x-api-key'] as string;
        console.log({ apiKeyHeader })
        if (apiKeyHeader?.toString().length < 0) {
            res.status(401).json({ message: 'Unauthorized: x-api-key header missing' });
            return;
        }
        // parse the x-api-key
        const {
            signature,
            timestamp: reqTimestamp,
        } = valueParser(apiKeyHeader) || {};
        // check if provided or not
        if (!signature || !reqTimestamp) unAuthorizedErrorResponse(res);

        // calculate auth time
        const authTimeTolleranceSec = 60 * 2;
        // check if expired
        if (Date.now() / 1000 - Number(reqTimestamp) > authTimeTolleranceSec) return unAuthorizedErrorResponse(res);
        // create hash value 
        const hash = createHmac('sha512', `${APP_SECRET_KEY}${reqTimestamp}`)
            .digest('hex');

        // check if has and signature are correct
        if (hash !== signature) return unAuthorizedErrorResponse(res);

        // Signature is valid, proceed to the next middleware or route
        return next();
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
const valueParser = (val: string) => {
    const re = /Signature=([A-Za-z0-9]+),Timestamp=([0-9]+)/;
    if (typeof val !== 'string') {
        return null;
    }
    const matches = val.match(re);
    matches && console.log(matches[1], matches[2])
    return matches && { signature: matches[1], timestamp: matches[2] };
};
const unAuthorizedErrorResponse = (res: Response, message?: string) => {
    res.status(401)
    res.json({
        message: 'Unauthorized: x-api-key header missing'
    });
}
export default authMiddleware;
