import express from 'express';
import { register, login, logout, updateProfile } from '../controllers/authController';
import jwtMiddleware from '../middlewares/jwtMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', jwtMiddleware, logout);
router.post('/profile/update', jwtMiddleware, updateProfile);


export default router;
