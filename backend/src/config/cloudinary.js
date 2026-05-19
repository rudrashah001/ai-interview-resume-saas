import { v2 as cloudinary } from 'cloudinary';

export const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

export const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    console.info(
      'Cloudinary not set — resume uploads will use local storage (backend/uploads). Add CLOUDINARY_* for production.'
    );
    return;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured');
};

export { cloudinary };
