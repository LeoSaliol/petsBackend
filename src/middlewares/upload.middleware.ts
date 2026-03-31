import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

export const postImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'petsocial_posts',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        } as any,
    }),
});

export const petImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'petsocial_pets',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        } as any,
    }),
});
