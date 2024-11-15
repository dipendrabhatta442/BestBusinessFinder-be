"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const businessController_1 = require("../controllers/businessController");
const jwtMiddleware_1 = __importDefault(require("../middlewares/jwtMiddleware"));
const businessController_2 = require("../controllers/businessController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = express_1.default.Router();
// Routes for the BusinessUser entity
router.post('/:id/reviews', jwtMiddleware_1.default, businessController_1.addReview);
exports.default = router;
// Public Routes
router.get('/', businessController_2.getAllBusinesses);
router.get('/:id', businessController_2.getBusinessDetails);
// Protected Route for Business Owners to Add Offerings with Image Upload
router.post('/:id/offerings', jwtMiddleware_1.default, uploadMiddleware_1.upload.single('image'), businessController_2.addOffering);
router.post('/update', jwtMiddleware_1.default, businessController_1.updateBusinessDetails);
