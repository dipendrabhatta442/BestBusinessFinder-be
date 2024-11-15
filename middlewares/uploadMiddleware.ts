import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Configure storage
const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        const userId = req.decoded?.userId;  // Assuming JWT middleware adds `userId` to `req.decoded`
        const businessName = req.body.businessName || 'default-business'; // Get the business name from the request body

        // Create a folder name using userId and business name
        const folderName = `${userId}_${businessName}`;
        const uploadPath = path.join(__dirname, '../uploads', folderName);

        // Create the directory if it doesn’t exist
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // No error, and the file type is accepted
    } else {
        cb(new Error('Only images are allowed')); // Pass Error with message
    }
};

export const upload = multer({ storage, fileFilter });
