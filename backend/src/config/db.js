import mongoose from 'mongoose';

const PLACEHOLDER_PATTERNS = [
  /@cluster\.mongodb\.net/i,
  /USER:PASS/i,
  /<username>/i,
  /<password>/i,
];

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy backend/.env.example to backend/.env and set a real connection string.'
    );
  }
  if (PLACEHOLDER_PATTERNS.some((re) => re.test(uri))) {
    throw new Error(
      'MONGODB_URI still uses the example placeholder. Use a real Atlas host (e.g. cluster0.xxxxx.mongodb.net) or local: mongodb://127.0.0.1:27017/ai_interview_resume — then run: docker compose up -d'
    );
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      throw new Error(
        `MongoDB host not found (${err.hostname || 'unknown'}). Check MONGODB_URI in backend/.env — the cluster name must match your Atlas cluster exactly.`
      );
    }
    throw err;
  }
};
