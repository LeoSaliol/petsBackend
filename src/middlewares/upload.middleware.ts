import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'petsocial_posts',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    }),
});

export const upload = multer({ storage });
