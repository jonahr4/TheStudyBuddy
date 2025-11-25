import mongoose from 'mongoose';

export interface IReport extends mongoose.Document {
  userId: string;
  userEmail: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  description: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new',
  },
}, {
  timestamps: true,
});

export const Report = mongoose.model<IReport>('Report', reportSchema);
