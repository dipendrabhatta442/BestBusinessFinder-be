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
exports.logout = exports.login = exports.updateProfile = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BusinessUser_1 = __importDefault(require("../models/BusinessUser"));
const BlacklistedToken_1 = __importDefault(require("../models/BlacklistedToken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword)
            throw new Error("Password doesn't match");
        const user = new BusinessUser_1.default({
            name,
            email,
            password,
        });
        yield user.save();
        const currentUser = yield BusinessUser_1.default.findOne({ email });
        const token = jsonwebtoken_1.default.sign({ id: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'Business registered successfully', token });
    }
    catch (error) {
        console.log({ error });
        res.status(400).json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.register = register;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { profileImage, name, email, phone } = req.body;
        const user = new BusinessUser_1.default({
            profileImage, name, email, phone
        });
        yield user.updateOne({
            _id: (_a = req.decoded) === null || _a === void 0 ? void 0 : _a.userId,
            profileImage, name, email, phone
        });
        res.status(201).json({ message: 'Business registered successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Registration failed', error });
    }
});
exports.updateProfile = updateProfile;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield BusinessUser_1.default.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ message: 'Login error', error });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(400).json({ message: 'Bad Request: No token provided' });
        return;
    }
    try {
        // Decode the token to get its expiration time
        const decoded = jsonwebtoken_1.default.decode(token);
        const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;
        if (!expiresAt) {
            res.status(400).json({ message: 'Bad Request: Token expiration not found' });
            return;
        }
        // Save the token in the blacklist with its expiration date
        yield new BlacklistedToken_1.default({ token, expiresAt }).save();
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to logout', error });
    }
});
exports.logout = logout;
