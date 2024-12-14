import express from 'express';
import { register, login, logout, updateProfile, profile, Adminlogin } from '../controllers/authController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import { uploadForRegister } from '../middlewares/uploadMiddlewareForRegister';

const router = express.Router();

router.post('/register', uploadForRegister.single('profileImage'), register);
router.post('/login', login);
router.post('/admin/login', Adminlogin);
router.post('/logout', jwtMiddleware, logout);
router.post('/profile/update', jwtMiddleware, upload.single('profileImage'), updateProfile);
router.get('/profile', jwtMiddleware, profile);


export default router;
