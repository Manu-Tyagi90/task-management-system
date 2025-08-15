const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configured for:', process.env.CLOUDINARY_CLOUD_NAME);

// Use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - Name:', file.originalname, 'Type:', file.mimetype);
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    
    cb(null, true);
  }
});

const uploadToCloudinary = async (fileBuffer, originalName) => {
  try {
    console.log('Starting Cloudinary upload for:', originalName);
    
    // Remove .pdf extension from filename for public_id
    const nameWithoutExt = originalName.replace(/\.pdf$/i, '');
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'task-management',
          public_id: `task-doc-${timestamp}-${randomNum}`, // Don't include .pdf in public_id
          format: 'pdf',
          type: 'upload',
          access_mode: 'public'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Upload success - Public ID:', result.public_id);
            console.log('Upload success - URL:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error('Upload to Cloudinary failed:', error);
    throw error;
  }
};

// Function to get download URL
const getDownloadUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    flags: 'attachment',
    type: 'upload'
  });
};

module.exports = { cloudinary, upload, uploadToCloudinary, getDownloadUrl };