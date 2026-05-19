import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stripeEventId: { type: String, unique: true, sparse: true },
    type: { type: String, required: true },
    amount: { type: Number },
    currency: { type: String, default: 'usd' },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('PaymentEvent', paymentEventSchema);
