"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const APP_SECRET_KEY = process.env.APP_SECRET_KEY || 'your-secret-key';
const valueParser = (val) => {
    const re = /Signature=([A-Za-z0-9]+),Timestamp=([0-9]+)/;
    if (typeof val !== 'string') {
        return null;
    }
    const matches = val.match(re);
    return matches && { signature: matches[1], timestamp: matches[2] };
};
const unAuthorizedErrorResponse = (res, message) => {
    res.status(401);
    res.json({
        message: 'Unauthorized: x-api-key header missing'
    });
};
const authMiddleware = (req, res, next) => {
    try {
        // Retrieve x-api-key header
        const apiKeyHeader = req.headers['x-api-key'];
        if (!apiKeyHeader) {
            res.status(401).json({ message: 'Unauthorized: x-api-key header missing' });
            return;
        }
        // parse the x-api-key
        const { signature, timestamp: reqTimestamp, } = valueParser(apiKeyHeader) || {};
        // check if provided or not
        if (!signature || !reqTimestamp)
            unAuthorizedErrorResponse(res);
        // calculate auth time
        const authTimeTolleranceSec = 60 * 2;
        // check if expired
        if (Date.now() / 1000 - Number(reqTimestamp) > authTimeTolleranceSec)
            return unAuthorizedErrorResponse(res);
        // create hash value 
        const hash = (0, crypto_1.createHmac)('sha512', `${process.env.APP_SECRET_KEY}${reqTimestamp}`)
            .digest('hex');
        // check if has and signature are correct
        if (hash !== signature)
            return unAuthorizedErrorResponse(res);
        // Signature is valid, proceed to the next middleware or route
        return next();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
exports.default = authMiddleware;
