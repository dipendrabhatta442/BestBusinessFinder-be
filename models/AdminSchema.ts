import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IAdmin extends Document {
    email: string;
    password: string;
    isSuperAdmin: boolean; // Identifies if the admin is a super admin
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema<IAdmin> = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        isSuperAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware to hash the password
AdminSchema.pre('save', async function (next) {
    const admin = this as IAdmin;

    if (!admin.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);

    next();
});

// Method to compare hashed password
AdminSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
