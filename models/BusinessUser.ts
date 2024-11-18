import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IReview {
    createdDate: Date
    id: string
    name: string;
    review: string;
    reply: string | undefined;
    rating: number;
}

export interface IOffering {
    id: string
    title: string;
    description: string;
    price: number;
    image: string; // URL or path to the offering image
}

export interface IBusinessUser extends Document {
    name: string;
    slug: string;
    email: string;
    password: string;
    category: string;
    profileImage: string;
    location: string;
    contactNumber: string;
    description: string;
    rating: number;
    reviews: IReview[];
    offerings: IOffering[];
    phone: string
    comparePassword(password: string): Promise<boolean>;
}

const BusinessUserSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, required: false },
    location: { type: String, required: false },
    description: { type: String },
    contactNumber: { type: String },
    profileImage: { type: String, required: false },
    rating: { type: Number, default: 0 },
    reviews: [
        {
            id: String,
            createdDate: { type: Date, },
            name: { type: String, },
            reply: { type: String, reqquired: false },
            review: { type: String, required: true },
            rating: { type: Number, required: true },
        },
    ],
    offerings: [
        {
            id: String,
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
    this.slug = this.name.split(" ").join('-')
    next();
});

// Method to compare passwords
BusinessUserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IBusinessUser>('BusinessUser', BusinessUserSchema);
