import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import BusinessUser, { IBusinessUser } from '../models/BusinessUser';
import BlacklistedToken from '../models/BlacklistedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) throw new Error("Password doesn't match")
        const user: IBusinessUser = new BusinessUser({
            name,
            email,
            password,
        });
        await user.save();
        const currentUser = await BusinessUser.findOne({ email });
        const token = jwt.sign({ id: currentUser?._id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'Business registered successfully', token });
    } catch (error: any) {
        console.log({ error })
        res.status(400).json({ message: error?.message });
    }
};
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profileImage, name, email, phone } = req.body;
        const user: IBusinessUser = new BusinessUser({
            profileImage, name, email, phone
        });
        await user.updateOne(
            {
                _id: req.decoded?.userId,
                profileImage, name, email, phone
            }
        );
        res.status(201).json({ message: 'Business registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed', error });
    }
};
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await BusinessUser.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error });
    }
};
export const logout = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(400).json({ message: 'Bad Request: No token provided' });
        return;
    }

    try {
        // Decode the token to get its expiration time
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;

        if (!expiresAt) {
            res.status(400).json({ message: 'Bad Request: Token expiration not found' });
            return;
        }

        // Save the token in the blacklist with its expiration date
        await new BlacklistedToken({ token, expiresAt }).save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to logout', error });
    }
};