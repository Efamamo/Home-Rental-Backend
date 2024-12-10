import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set MIME types (if needed for validation or metadata)
const MIME_TYPES = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/avif': 'avif',
  'image/webp': 'webp',
};

// Configure Cloudinary storage for multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'images', // Specify folder in your Cloudinary account
    format: async (req, file) => {
      // Use the MIME type mapping or default to 'jpeg'
      return MIME_TYPES[file.mimetype] || 'jpeg';
    },
    public_id: (req, file) => uuidv4(), // Generate unique public ID for the image
  },
});

// Configure multer with Cloudinary storage
const fileUpload = multer({ storage: cloudinaryStorage });

export const uploadImages = fileUpload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'sub_images', maxCount: 10 },
]);

export default uploadImages;
