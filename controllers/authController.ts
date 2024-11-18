import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import BusinessUser, { IBusinessUser } from '../models/BusinessUser';
import BlacklistedToken from '../models/BlacklistedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {

        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'No image file uploaded' });
        }
        const { name, email, password, category, location, description, contactNumber } = req.body;
        // if (password !== confirmPassword) throw new Error("Password doesn't match")
        const user: IBusinessUser = new BusinessUser({
            name,
            email,
            password,
            category,
            location,
            description,
            contactNumber,
            profileImage: file ? `/uploads/${name?.split(' ').join('-')}/${file?.filename}` : undefined,
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
        const { name, profileImage, category, description } = req.body;
        const file = req.file;
        const newProfile = {
            name, category, description,
            profileImage: req.file ? `/uploads/${name?.split(' ').join('-')}/${file?.filename}` : profileImage
        }
        await BusinessUser.updateOne(
            {
                ...newProfile,
                _id: req.decoded?.userId
            }
        );
        res.status(201).json({ message: 'Business Updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Business Updated failed', error });
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

export const profile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req?.decoded?.userId;
        if (!userId) res.status(400).json({ message: 'UserId is not found in jwt' })
        const business = await BusinessUser.findById(
            userId
        );
        res.status(201).json({ message: 'Business registered successfully', data: business });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed', error });
    }
};
