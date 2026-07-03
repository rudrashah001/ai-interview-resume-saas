import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { isAiConfigured } from './utils/openaiClient.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { webhookStripe } from './controllers/paymentController.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import premiumRoutes from './routes/premiumRoutes.js';

import User from './models/User.js';
import { UPLOADS_ROOT, ensureUploadsDir } from './utils/fileStorage.js';

const app = express();
configureCloudinary();
if (isAiConfigured()) {
  console.log('Gemini AI configured');
} else {
  console.warn('GEMINI_API_KEY missing — AI chat, interview & resume analysis will fail');
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhookStripe
);

app.use(express.json({ limit: '2mb' }));
app.use(apiLimiter);

app.use(
  '/uploads',
  express.static(UPLOADS_ROOT, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/premium', premiumRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const bootstrapAdmin = async () => {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  if (!email) return;
  await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: 'admin' }
  );
};

connectDB()
  .then(() => ensureUploadsDir())
  .then(bootstrapAdmin)
  .then(() => {
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
