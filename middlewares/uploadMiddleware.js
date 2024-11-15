"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        var _a;
        const userId = (_a = req.decoded) === null || _a === void 0 ? void 0 : _a.userId; // Assuming JWT middleware adds `userId` to `req.decoded`
        const businessName = req.body.businessName || 'default-business'; // Get the business name from the request body
        // Create a folder name using userId and business name
        const folderName = `${userId}_${businessName}`;
        const uploadPath = path_1.default.join(__dirname, '../uploads', folderName);
        // Create the directory if it doesn’t exist
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // No error, and the file type is accepted
    }
    else {
        cb(new Error('Only images are allowed')); // Pass Error with message
    }
};
exports.upload = (0, multer_1.default)({ storage, fileFilter });
