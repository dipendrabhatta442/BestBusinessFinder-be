import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

// Configure storage
const storage = multer.diskStorage({
    destination: async (req: Request, file, cb) => {

        const businessName = req.body.name

        // Create a folder name using userId and business name
        const folderName = `${businessName?.split(' ').join('-')}`;
        const uploadPath = path.join(__dirname, '../uploads', folderName);

        // Create the directory if it doesn’t exist
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname?.split(' ').join('-')}`);
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

export const uploadForRegister = multer({ storage, fileFilter });
