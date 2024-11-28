import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const MIME_TYPES = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/avif': 'avif',
  'image/webp': 'webp',
};

// Configure multer storage
const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4() + path.extname(file.originalname)); // Generate unique filename
    },
  }),
});

export const uploadImages = fileUpload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'sub_images', maxCount: 10 },
]);

export default uploadImages;
