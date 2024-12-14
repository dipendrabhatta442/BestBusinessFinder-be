import express from 'express';
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    getPendingCampaigns,
    updateCampaignStatus,
    getCampaignsByUserId,
    getRejectedCampaigns,
    getApprovedCampaigns,
} from '../controllers/campaignController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

// Public routes
router.get('/', getCampaigns);
router.get('/info/:id', getCampaignById)
router.get('/approved', getApprovedCampaigns);

// Protected routes
router.get('/user', jwtMiddleware, roleMiddleware(['BusinessUser']), getCampaignsByUserId);
router.post('/', jwtMiddleware, roleMiddleware(['BusinessUser']), upload.single('image'), createCampaign);
router.put('/:id', jwtMiddleware, roleMiddleware(['BusinessUser']), upload.single('image'), updateCampaign);
router.delete('/:id', jwtMiddleware, roleMiddleware(['BusinessUser']), deleteCampaign);
// Admin routes

router.get('/pending', jwtMiddleware, roleMiddleware(['Admin']), getPendingCampaigns);
router.get('/rejected', jwtMiddleware, roleMiddleware(['Admin']), getRejectedCampaigns);
router.get('/approved', jwtMiddleware, roleMiddleware(['Admin', 'BusinessUser']), getApprovedCampaigns);
router.patch('/status/:id', jwtMiddleware, roleMiddleware(['Admin']), updateCampaignStatus);

export default router;
