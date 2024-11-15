"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BlacklistedToken_1 = __importDefault(require("../models/BlacklistedToken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const jwtMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }
    // Check if token is blacklisted
    const isBlacklisted = yield BlacklistedToken_1.default.findOne({ token });
    if (isBlacklisted) {
        res.status(403).json({ message: 'Forbidden: Token is invalidated' });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
            req.decoded = { userId: decoded.id };
        }
        else {
            res.status(403).json({ message: 'Forbidden: Token structure invalid' });
            return;
        }
        next();
    });
});
exports.default = jwtMiddleware;
