import 'dotenv/config';
import { connectDB } from '../config/db.js';
import InterviewQuestionBank from '../models/InterviewQuestionBank.js';
import ResumeTemplate from '../models/ResumeTemplate.js';
import { FEATURED_COMPANIES } from '../config/features.js';

const SAMPLE_QUESTIONS = {
  Google: [
    { category: 'technical', question: 'Design a URL shortener at scale.', difficulty: 'hard' },
    { category: 'technical', question: 'Explain time complexity of binary search.', difficulty: 'medium' },
    { category: 'hr', question: 'Tell me about a time you disagreed with a teammate.', difficulty: 'medium' },
  ],
  Microsoft: [
    { category: 'technical', question: 'How would you implement an LRU cache?', difficulty: 'medium' },
    { category: 'hr', question: 'Describe a project where you showed growth mindset.', difficulty: 'easy' },
  ],
  Amazon: [
    { category: 'hr', question: 'Give an example using Amazon Leadership Principle "Customer Obsession".', difficulty: 'medium' },
    { category: 'technical', question: 'Optimize delivery route for packages (high level).', difficulty: 'hard' },
  ],
  Meta: [
    { category: 'technical', question: 'How does React reconciliation work?', difficulty: 'medium' },
    { category: 'hr', question: 'Tell me about moving fast with high quality.', difficulty: 'medium' },
  ],
  Infosys: [
    { category: 'technical', question: 'Explain REST vs SOAP with examples.', difficulty: 'easy' },
    { category: 'hr', question: 'Why do you want to join Infosys?', difficulty: 'easy' },
  ],
  'Tata Consultancy Services': [
    { category: 'technical', question: 'What is SDLC and which model do you prefer?', difficulty: 'easy' },
    { category: 'hr', question: 'How do you handle tight client deadlines?', difficulty: 'medium' },
  ],
};

const TEMPLATES = [
  { name: 'Classic', slug: 'classic', isPremium: false, description: 'Clean single-column layout' },
  { name: 'Modern Pro', slug: 'modern-pro', isPremium: true, description: 'Two-column with accent sidebar' },
  { name: 'Executive', slug: 'executive', isPremium: true, description: 'Senior leadership focused' },
];

async function seed() {
  await connectDB();

  for (const company of FEATURED_COMPANIES) {
    const samples = SAMPLE_QUESTIONS[company] || [];
    for (const s of samples) {
      await InterviewQuestionBank.findOneAndUpdate(
        { company, question: s.question },
        { ...s, company, jobTitle: 'Software Engineer', isActive: true },
        { upsert: true, new: true }
      );
    }
  }

  for (const t of TEMPLATES) {
    await ResumeTemplate.findOneAndUpdate({ slug: t.slug }, t, {
      upsert: true,
      new: true,
    });
  }

  console.log('Seed complete: interview questions + resume templates');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
