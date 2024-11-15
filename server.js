"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const businessRoutes_1 = __importDefault(require("./routes/businessRoutes"));
const authMiddleware_1 = __importDefault(require("./middlewares/authMiddleware"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, db_1.default)();
// Use the middleware for all routes that require API key validation=
app.use(authMiddleware_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/business', businessRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
