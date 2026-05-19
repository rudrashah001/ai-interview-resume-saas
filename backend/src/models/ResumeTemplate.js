import mongoose from 'mongoose';

const resumeTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    isPremium: { type: Boolean, default: true },
    previewUrl: { type: String, default: '' },
    structure: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('ResumeTemplate', resumeTemplateSchema);
