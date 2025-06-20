import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: 'upvote' | 'comment' | 'follow' | 'post' | 'achievement';
  message: string;
  relatedRant?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['upvote', 'comment', 'follow', 'post', 'achievement'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedRant: {
    type: Schema.Types.ObjectId,
    ref: 'Rant',
  },
  relatedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IActivity>('Activity', activitySchema); 