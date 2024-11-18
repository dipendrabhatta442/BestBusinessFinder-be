import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BusinessUser, { IBusinessUser } from '../models/BusinessUser';
import { randomUUID } from 'crypto';
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
        const business = await BusinessUser.findOne({ slug: req.params.id });
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const { review, name, rating } = req.body;
        // const userId = req.decoded?.userId;
        // if (!userId) {
        //     res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        //     return;
        // }

        business.reviews.push({ id: randomUUID(), createdDate: new Date(), name, review, reply: '', rating: Number(rating) });
        business.rating = rating;

        await business.save();
        res.json(business);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add review', error });
    }
};

export const addReviewReplay = async (req: Request, res: Response): Promise<void> => {
    try {
        const business = await BusinessUser.findById(req.decoded?.userId);
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const { reply, reviewId } = req.body;
        // Validate the reply
        if (!reply || typeof reply !== 'string' || reply.trim() === '') {
            res.status(400).json({ message: 'Invalid reply content' });
            return;
        }
        // const userId = req.decoded?.userId;
        // if (!userId) {
        //     res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        //     return;
        // }
        const review = business.reviews.find(review => review.id === reviewId);
        if (!review) {
            res.status(404).json({ message: 'Review not found' });
        }
        review!.reply = reply;

        await business.save();
        res.status(200).json(business);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add review', error });
    }
};


// Get All Businesses with Filters
export const getAllBusinesses = async (req: Request, res: Response): Promise<void> => {
    const { category, location, search, minRating } = req.query;
    const query: any = {};
    if (category && category?.toString().length > 0) query.category = category;
    if (location && location?.toString().length > 0) query.location = { $regex: new RegExp(location as string, 'i') };
    if (minRating && minRating?.toString().length > 0) query.rating = { $gte: Number(minRating) };
    if (search && search?.toString().length > 0) {
        query.$or = [
            { name: { $regex: new RegExp(search as string, 'i') } },
            { description: { $regex: new RegExp(search as string, 'i') } },
            { location: { $regex: new RegExp(search as string, 'i') } },
        ];
    }

    try {
        const businesses = await BusinessUser.find(query);
        res.json({ message: 'Successfully retrieve businesses', data: businesses });
    } catch (error) {
        res.status(400).json({ message: 'Failed to retrieve businesses', error });
    }
};

// Get Business Details with Reviews and Offerings
export const getBusinessDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const business = await BusinessUser.findOne({ slug: req?.params.id })
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        res.json({ message: "Successfully retrive business", data: business });
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
        const imagePath = req.file ? `/uploads/${business?.name?.split(' ').join('-')}/${req.file?.filename}` : '';

        business.offerings.push({ id: randomUUID(), title, description, price, image: imagePath });
        await business.save();
        res.json({ message: "Successfully Added offerings", data: business });
    } catch (error) {
        res.status(400).json({ message: 'Failed to add offering', error });
    }
};
export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.params.id) res.status(400).json({ message: 'Product Id was not provided.' })
        const business = await BusinessUser.findById(req.decoded?.userId);
        if (!business) {
            res.status(404).json({ message: 'Business not found.' });
            return;
        }
        const newOfferings = business.offerings?.filter(item => item.id !== req.params.id);
        await BusinessUser.updateOne({
            _id: business._id,
            offerings: newOfferings
        })
        res.status(200).json({ message: 'Successfully remove/deleted the item.' })
    } catch (error) {
        res.status(400).json({ message: 'Failed to remove product.', error });

    }
}