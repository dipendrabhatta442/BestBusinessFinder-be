import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import businessRoutes from './routes/businessRoutes';
import campaignRoutes from './routes/campaignRoutes';
import authMiddleware from './middlewares/authMiddleware';
import path from 'path';
import { config } from './config/environment';
import Admin from './models/AdminSchema'; // Import the Admin model
import jwtMiddleware from './middlewares/jwtMiddleware';
import mongoose from 'mongoose';

dotenv.config();

const app: Application = express();
app.use(cors({
    origin: '*',  // Accept all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],  // Allow these methods
    allowedHeaders: ['Content-Type', 'X-Api-Key', 'Authorization'],  // Accept specific headers (optional)
}));
app.use(express.json());
connectDB();
// Function to run migration
const runMigration = async () => {
    try {
        const existingSuperAdmin = await Admin.findOne({ email: 'superadmin@gmail.com' });
        if (!existingSuperAdmin) {
            const superAdmin = new Admin({
                email: 'superadmin@gmail.com',
                password: 'SuperAdmin@123',
                isSuperAdmin: true,
            });
            await superAdmin.save();
            console.log('Super admin created successfully.');
        } else {
            console.log('Super admin already exists.');
        }
    } catch (error) {
        console.error('Error running migration:', error);
    }
};

// Run the migration when the server starts
runMigration();
// Use the middleware for all routes that require x-API-key validation=
// app.use(authMiddleware);

// Serve static files (for the uploaded images)
app.use('/api/public/uploads', express.static(config.uploadDir));
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/campaign', campaignRoutes);
app.use(jwtMiddleware, (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.decoded?.userId);

    console.log("Decoded user:", userId); // Check if this is populated
    next();
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
