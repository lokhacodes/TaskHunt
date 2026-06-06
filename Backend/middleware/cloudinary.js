const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
const requiredCloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const k of requiredCloudinary) {
  if (!process.env[k] || String(process.env[k]).trim() === '') {
    console.error(
      `Cloudinary env missing: ${k}. Current env keys (lowercase match):`,
      Object.keys(process.env)
        .filter((x) => x.toLowerCase().includes('cloudinary'))
        .sort()
    );
  }
}

// Support the combined Cloudinary URL format commonly provided as CLOUDINARY_URL
// If individual vars are not set, try to parse CLOUDINARY_URL.
if (
  (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) &&
  process.env.CLOUDINARY_URL
) {
  const m = String(process.env.CLOUDINARY_URL).match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  // m[1]=api_key, m[2]=api_secret, m[3]=cloud_name (may include extra path/query)
  if (m) {
    process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || m[1];
    process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || m[2];
    process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || m[3].split('/')[0];
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'social-app-posts', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }],
  },
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = { upload, cloudinary };

