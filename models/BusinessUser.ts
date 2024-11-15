import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IReview {
    user: mongoose.Types.ObjectId;
    review: string;
    rating: number;
}

export interface IOffering {
    title: string;
    description: string;
    price: number;
    image: string; // URL or path to the offering image
}

export interface IBusinessUser extends Document {
    name: string;
    email: string;
    password: string;
    category: string;
    profileImage: string;
    location: string;
    description: string;
    rating: number;
    reviews: IReview[];
    offerings: IOffering[];
    phone: string
    comparePassword(password: string): Promise<boolean>;
}

const BusinessUserSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, required: false },
    location: { type: String, required: false },
    description: { type: String },
    profileImage: { type: String, required: false },
    rating: { type: Number, default: 0 },
    reviews: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'BusinessUser' },
            review: { type: String, required: true },
            rating: { type: Number, required: true },
        },
    ],
    offerings: [
        {
            title: { type: String, required: true },
            description: String,
            price: Number,
            image: String, // New field to store image URL or path
        },
    ],
});

// Password hashing middleware
BusinessUserSchema.pre<IBusinessUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
BusinessUserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IBusinessUser>('BusinessUser', BusinessUserSchema);
