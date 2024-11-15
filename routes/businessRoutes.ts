import express from 'express';
import { addReview, updateBusinessDetails } from '../controllers/businessController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import { getAllBusinesses, getBusinessDetails, addOffering } from '../controllers/businessController';
import { upload } from '../middlewares/uploadMiddleware';
const router = express.Router();

// Routes for the BusinessUser entity
router.post('/:id/reviews', jwtMiddleware, addReview);

export default router;
// Public Routes
router.get('/', getAllBusinesses);
router.get('/:id', getBusinessDetails);

// Protected Route for Business Owners to Add Offerings with Image Upload
router.post('/:id/offerings', jwtMiddleware, upload.single('image'), addOffering);
router.post('/update', jwtMiddleware, updateBusinessDetails);
