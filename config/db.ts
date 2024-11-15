import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bbf_db');
        console.log('MongoDB connected to bbf_db');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

export default connectDB;
