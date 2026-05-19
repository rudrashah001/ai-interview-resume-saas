import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and images are allowed'), false);
  }
};

export const uploadResumeFile = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter,
});
