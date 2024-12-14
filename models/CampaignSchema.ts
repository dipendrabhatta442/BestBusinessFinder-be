import mongoose, { Schema, Document, Types } from 'mongoose';

interface ICampaign extends Document {
    title: string;
    description: string;
    createdBy: Types.ObjectId;
    image?: string;
    remarks?: string;
    tags?: string[];
    isPublic: boolean;
    status: 'Pending' | 'Approved' | 'Rejected'; // Approval status
    createdAt: Date;
    updatedAt: Date;
}

const CampaignSchema: Schema<ICampaign> = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'BusinessUser', required: true },
        image: { type: String, },
        remarks: { type: String, },
        tags: { type: [String], default: [] },
        isPublic: { type: Boolean, default: false },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, // Default to 'Pending'
    },
    { timestamps: true }
);

const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
