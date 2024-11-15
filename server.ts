import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import businessRoutes from './routes/businessRoutes';
import authMiddleware from './middlewares/authMiddleware';

dotenv.config();

const app: Application = express();
app.use(cors({
    origin: '*',  // Accept all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow these methods
    allowedHeaders: ['Content-Type', 'X-Api-Key', 'x-api-key','Authorization'],  // Accept specific headers (optional)
  }));
app.use(express.json());
connectDB();
// Use the middleware for all routes that require API key validation=
app.use(authMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
