import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true, index: true },
    jobTitle: { type: String, default: 'Software Engineer', trim: true },
    category: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'system-design'],
      default: 'technical',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    question: { type: String, required: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionBankSchema.index({ company: 1, category: 1 });

export default mongoose.model('InterviewQuestionBank', questionBankSchema);
