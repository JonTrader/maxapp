import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  jobDescription: { type: String },
  jobUrl: { type: String },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'],
    default: 'Saved'
  },
  location: { type: String },
  notes: { type: String },
  appliedDate: { type: Date },
  resumeSnapshot: { type: String },
  aiAnalysis: { type: Object, default: {} },
}, { timestamps: true });

applicationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Application', applicationSchema);
