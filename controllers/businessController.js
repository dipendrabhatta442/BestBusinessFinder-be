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
exports.addOffering = exports.getBusinessDetails = exports.getAllBusinesses = exports.addReview = exports.updateBusinessDetails = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BusinessUser_1 = __importDefault(require("../models/BusinessUser"));
const updateBusinessDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, category, profileImage } = req.body;
        const user = new BusinessUser_1.default({
            name, description, category, profileImage
        });
        yield user.updateOne({
            _id: (_a = req.decoded) === null || _a === void 0 ? void 0 : _a.userId, name, description, category, profileImage
        });
        res.status(201).json({ message: 'Business updated successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'updated failed', error });
    }
});
exports.updateBusinessDetails = updateBusinessDetails;
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const business = yield BusinessUser_1.default.findById(req.params.id);
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        const { review, rating } = req.body;
        const userId = (_a = req.decoded) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        business.reviews.push({ user: userObjectId, review, rating });
        business.rating = business.reviews.reduce((acc, review) => acc + review.rating, 0) / business.reviews.length;
        yield business.save();
        res.json(business);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to add review', error });
    }
});
exports.addReview = addReview;
// Get All Businesses with Filters
const getAllBusinesses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, location, search, minRating } = req.query;
    const query = {};
    console.log({ category, location, search, minRating });
    if (category && (category === null || category === void 0 ? void 0 : category.toString().length) > 0)
        query.category = category;
    if (location && (location === null || location === void 0 ? void 0 : location.toString().length) > 0)
        query.location = { $regex: new RegExp(location, 'i') };
    if (minRating && (minRating === null || minRating === void 0 ? void 0 : minRating.toString().length) > 0)
        query.rating = { $gte: Number(minRating) };
    if (search && (search === null || search === void 0 ? void 0 : search.toString().length) > 0) {
        query.$or = [
            { name: { $regex: new RegExp(search, 'i') } },
            { description: { $regex: new RegExp(search, 'i') } },
        ];
    }
    try {
        const businesses = yield BusinessUser_1.default.find(query);
        res.json(businesses);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to retrieve businesses', error });
    }
});
exports.getAllBusinesses = getAllBusinesses;
// Get Business Details with Reviews and Offerings
const getBusinessDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const business = yield BusinessUser_1.default.findById(req.params.id).populate('reviews.user', 'name');
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        res.json(business);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to retrieve business', error });
    }
});
exports.getBusinessDetails = getBusinessDetails;
// Add an Offering to a Business (Only for the business owner)
const addOffering = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const business = yield BusinessUser_1.default.findById((_a = req.decoded) === null || _a === void 0 ? void 0 : _a.userId);
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        const { title, description, price } = req.body;
        const imagePath = req.file ? `/uploads/${(_b = req.decoded) === null || _b === void 0 ? void 0 : _b.userId}_${req.body.businessName}/${req.file.filename}` : ''; // Get image path with subfolder
        business.offerings.push({ title, description, price, image: imagePath });
        yield business.save();
        res.json(business);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to add offering', error });
    }
});
exports.addOffering = addOffering;
