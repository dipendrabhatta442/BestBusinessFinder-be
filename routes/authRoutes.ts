import express from 'express';
import { register, login, logout, updateProfile, profile } from '../controllers/authController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.post('/logout', jwtMiddleware, logout);
router.post('/profile/update', jwtMiddleware, upload.single('profileImage'), updateProfile);
router.get('/profile', jwtMiddleware, profile);


export default router;
