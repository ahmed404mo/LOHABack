const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected successfully'))
  .catch(err => console.error('❌ Cloudinary connection failed:', err.message));

// Check if CloudinaryStorage exists and is a constructor
let productStorage;
let customOrderStorage;

try {
  // Try the newer version (factory function)
  productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'loha/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
    }
  });

  customOrderStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'loha/custom-orders',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
    }
  });
} catch (error) {
  console.error('Error creating CloudinaryStorage:', error.message);
  // Fallback to memory storage if CloudinaryStorage fails
  productStorage = multer.memoryStorage();
  customOrderStorage = multer.memoryStorage();
}

// Create multer instances
const uploadProduct = multer({ 
  storage: productStorage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadCustomOrder = multer({ 
  storage: customOrderStorage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Helper function to upload buffer to Cloudinary (fallback)
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

module.exports = { 
  cloudinary, 
  uploadProduct, 
  uploadCustomOrder,
  uploadBufferToCloudinary
};