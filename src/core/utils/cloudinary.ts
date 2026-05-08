import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected successfully'))
  .catch((err: any) => console.error('❌ Cloudinary connection failed:', err.message));

// Product storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'loha/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
  } as any
});

// Custom order storage
const customOrderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'loha/custom-orders',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
  } as any
});

export const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadCustomOrder = multer({
  storage: customOrderStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export { cloudinary };