import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'messenger_clone_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'mkv', 'avi', 'mov', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'],
    resource_type: 'auto', // Automatically detect image, video, or raw file
    transformation: [
      {
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    ]
  }
});

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for small files (large files use chunked upload)
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and documents
    const allowedMimes = [
      'image/', 'video/', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-rar-compressed'
    ];
    
    const isAllowed = allowedMimes.some(mime => file.mimetype.startsWith(mime) || file.mimetype === mime);
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Only images, videos, and documents are allowed.'), false);
    }
  }
});

// Avatar-specific upload configuration
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'messenger_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    ]
  }
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars.'), false);
    }
  }
});

export default cloudinary;
