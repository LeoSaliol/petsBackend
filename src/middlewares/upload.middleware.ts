import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

export const postImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'petsocial_posts',
            allowed_formats: ['jpg', 'png', 'jpeg'],
        } as any,
    }),
});

export const petImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'petsocial_posts',
            allowed_formats: ['jpg', 'png', 'jpeg'],
        } as any,
    }),
});
