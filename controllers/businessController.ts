import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BusinessUser, { IBusinessUser } from '../models/BusinessUser';
export const updateBusinessDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, category, profileImage } = req.body;
        const user: IBusinessUser = new BusinessUser({
            name, description, category, profileImage
        });
        await user.updateOne({
            _id: req.decoded?.userId as string, name, description, category, profileImage
        });
        res.status(201).json({ message: 'Business updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'updated failed', error });
    }
};
export const addReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const business = await BusinessUser.findById(req.params.id);
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const { review, rating } = req.body;
        const userId = req.decoded?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        business.reviews.push({ user: userObjectId, review, rating });
        business.rating = business.reviews.reduce((acc, review) => acc + review.rating, 0) / business.reviews.length;

        await business.save();
        res.json(business);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add review', error });
    }
};
// Get All Businesses with Filters
export const getAllBusinesses = async (req: Request, res: Response): Promise<void> => {
    const { category, location, search, minRating } = req.query;
    const query: any = {};
    console.log({ category, location, search, minRating })
    if (category && category?.toString().length > 0) query.category = category;
    if (location && location?.toString().length > 0) query.location = { $regex: new RegExp(location as string, 'i') };
    if (minRating && minRating?.toString().length > 0) query.rating = { $gte: Number(minRating) };
    if (search && search?.toString().length > 0) {
        query.$or = [
            { name: { $regex: new RegExp(search as string, 'i') } },
            { description: { $regex: new RegExp(search as string, 'i') } },
        ];
    }

    try {
        const businesses = await BusinessUser.find(query);
        res.json(businesses);
    } catch (error) {
        res.status(400).json({ message: 'Failed to retrieve businesses', error });
    }
};

// Get Business Details with Reviews and Offerings
export const getBusinessDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const business = await BusinessUser.findById(req.params.id).populate('reviews.user', 'name');
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        res.json(business);
    } catch (error) {
        res.status(400).json({ message: 'Failed to retrieve business', error });
    }
};

// Add an Offering to a Business (Only for the business owner)
export const addOffering = async (req: Request, res: Response): Promise<void> => {
    try {
        const business = await BusinessUser.findById(req.decoded?.userId);
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const { title, description, price } = req.body;
        const imagePath = req.file ? `/uploads/${req.decoded?.userId}_${req.body.businessName}/${req.file.filename}` : ''; // Get image path with subfolder

        business.offerings.push({ title, description, price, image: imagePath });
        await business.save();
        res.json(business);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add offering', error });
    }
};