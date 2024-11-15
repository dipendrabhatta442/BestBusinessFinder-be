import mongoose, { Document, Schema } from 'mongoose';

export interface IBlacklistedToken extends Document {
    token: string;
    expiresAt: Date;
}

const BlacklistedTokenSchema: Schema = new Schema({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

// Automatically delete tokens after their expiration time
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IBlacklistedToken>('BlacklistedToken', BlacklistedTokenSchema);
