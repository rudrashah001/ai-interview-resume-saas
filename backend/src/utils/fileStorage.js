import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

const EXT_BY_MIME = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

export const getPublicBaseUrl = () =>
  (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(
    /\/$/,
    ''
  );

export async function ensureUploadsDir() {
  await fs.mkdir(path.join(UPLOADS_ROOT, 'resumes'), { recursive: true });
}

function extensionFor(file) {
  if (EXT_BY_MIME[file.mimetype]) return EXT_BY_MIME[file.mimetype];
  const fromName = path.extname(file.originalname || '');
  return fromName || '.bin';
}

export async function storeResumeUpload(file, { userId, resumeId }) {
  if (isCloudinaryConfigured()) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'resumes', resource_type: 'auto' },
        (err, upload) => (err ? reject(err) : resolve(upload))
      );
      stream.end(file.buffer);
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  const ext = extensionFor(file);
  const filename = `${userId}-${resumeId}-${Date.now()}${ext}`;
  const relativePath = path.join('resumes', filename).replace(/\\/g, '/');
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await fs.writeFile(absolutePath, file.buffer);
  return {
    url: `${getPublicBaseUrl()}/uploads/${relativePath}`,
    publicId: `local:${relativePath}`,
  };
}

export async function deleteStoredFile(publicId) {
  if (!publicId) return;
  if (publicId.startsWith('local:')) {
    const relativePath = publicId.slice('local:'.length);
    await fs.unlink(path.join(UPLOADS_ROOT, relativePath)).catch(() => {});
    return;
  }
  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      /* ignore */
    }
  }
}
