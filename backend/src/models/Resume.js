import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    fullName: { type: String, default: '' },
    headline: { type: String, default: '' },
    summary: { type: String, default: '' },
    experience: [
      {
        company: String,
        role: String,
        start: String,
        end: String,
        bullets: [String],
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        year: String,
      },
    ],
    skills: [String],
    projects: [{ name: String, description: String, link: String }],
    contact: {
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
    },
    resumeFile: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
