import mongoose from 'mongoose';

const qaSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    feedback: { type: String, default: '' },
    category: {
      type: String,
      enum: ['technical', 'hr', 'behavioral'],
      default: 'technical',
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    items: [qaSchema],
  },
  { timestamps: true }
);

export default mongoose.model('InterviewSession', interviewSessionSchema);
