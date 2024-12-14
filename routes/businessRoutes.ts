import express from 'express';
import { addReview, addReviewReplay, getBusinessOfferingDetails, remove, updateBusinessDetails } from '../controllers/businessController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import { getAllBusinesses, getBusinessDetails, addOffering } from '../controllers/businessController';
import { upload } from '../middlewares/uploadMiddleware';
const router = express.Router();

// Routes for the BusinessUser entity
router.post('/review/:id', addReview);

// Public Routes
router.get('/', getAllBusinesses);
router.get('/offering/:id', getBusinessOfferingDetails);
router.get('/:id', getBusinessDetails);

// Protected Route for Business Owners to Add Offerings with Image Upload
router.post('/offerings', jwtMiddleware, upload.single('image'), addOffering);
router.post('/update', jwtMiddleware, updateBusinessDetails);
router.delete('/:id', jwtMiddleware, remove);
router.put('/review/reply', jwtMiddleware, addReviewReplay);

export default router;

