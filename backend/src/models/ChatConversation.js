import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const chatConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { 
      type: String, default: 'New chat' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model('ChatConversation', chatConversationSchema);
