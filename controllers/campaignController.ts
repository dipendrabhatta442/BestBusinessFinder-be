import { Request, Response } from 'express';
import Campaign from '../models/CampaignSchema';
import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
// Create a new campaign
export const createCampaign = async (req: Request, res: Response): Promise<void> => {
    try {

        const file = req.file;
        console.log(file);
        if (!file) {
            res.status(400).json({ message: 'No image file uploaded' });
            return;
        }
        const { title, description, tags } = req.body;
        // Create the campaign
        const campaign = new Campaign({
            title,
            description,
            image: file ? file?.path?.split('/backend')[1] : '',
            tags,
            isPublic: true,
            createdBy: req.decoded?.userId,
        });

        await campaign.save();
        res.status(201).json({ success: true, message: 'Campaign created successfully', data: campaign });
    } catch (error: any) {
        console.log({ error })
        res.status(500).json({ success: false, message: 'Failed to create campaign', error: error.message });
    }
};

// Get all campaigns (public and admin-specific)
export const getCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const campaigns = await Campaign.find().populate('createdBy');;
        res.status(200).json({ success: true, data: campaigns });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'this Failed to fetch campaigns', error: error.message });
    }
};
export const getCampaignsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        // Log the decoded payload for debugging
        console.log("Decoded payload:", req.decoded);

        // Validate the userId in req.decoded
        if (!req.decoded?.userId) {
            res.status(401).json({ success: false, message: 'User is not logged in.' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(req.decoded.userId)) {
            res.status(400).json({ success: false, message: 'Invalid user ID format.' });
            return;
        }

        const userId = new mongoose.Types.ObjectId(req.decoded.userId);

        // Fetch campaigns for the user
        const campaigns = await Campaign.find({ createdBy: userId }).populate('createdBy');;
        res.status(200).json({ success: true, data: campaigns });
    } catch (error: any) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch campaigns', error: error.message });
    }
};

// Get a single campaign by ID
export const getCampaignById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const campaign = await Campaign.findById(id).populate('createdBy');;
        if (!campaign) {
            res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch campaign', error: error.message });
    }
};

// Update a campaign
export const updateCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const campaign = await Campaign.findByIdAndUpdate(id, updates, { new: true });
        if (!campaign) {
            res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        res.status(200).json({ success: true, message: 'Campaign updated successfully', data: campaign });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update campaign', error: error.message });
    }
};

// Delete a campaign
export const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the campaign by ID
        const campaign = await Campaign.findById(id);
        if (!campaign) {
            res.status(404).json({ success: false, message: 'Campaign not found' });
            return;
        }

        // Remove the associated uploaded file if it exists
        if (campaign.image) {
            const filePath = path.join(__dirname, '../', campaign.image); // Adjust the path as per your project structure

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file: ${filePath}`, err);
                } else {
                    console.log(`File deleted: ${filePath}`);
                }
            });
        }

        // Delete the campaign
        await Campaign.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete campaign', error: error.message });
    }
};



// Approve or Reject Campaign
export const updateCampaignStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        console.log({ status, remarks })

        if (!['Approved', 'Rejected'].includes(status)) {
            res.status(400).json({ message: 'Invalid status value' });
            return;
        }

        const campaign = await Campaign.findById(id);
        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found' });
            return;
        }

        campaign.status = status;
        if (remarks) {
            campaign.remarks = remarks
        }
        if (status === 'Approved') {
            campaign.remarks = ''
        }
        await campaign.save();

        res.status(200).json({ message: `Campaign ${status.toLowerCase()} successfully`, campaign });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating campaign status', error: error.message });
    }
};

// Get all Pending Campaigns (Admin only)
export const getPendingCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const campaigns = await Campaign.find({ status: 'Pending' }).populate('createdBy');
        res.status(200).json({ success: true, data: campaigns });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching pending campaigns', error: error.message });
    }
};
export const getRejectedCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const campaigns = await Campaign.find({ status: 'Rejected' }).populate('createdBy');

        res.status(200).json({ success: true, data: campaigns });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching pending campaigns', error: error.message });
    }
};
export const getApprovedCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const campaigns = await Campaign.find({ status: 'Approved' }).populate('createdBy');
        res.status(200).json({ success: true, data: campaigns });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching pending campaigns', error: error.message });
    }
};