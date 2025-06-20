import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'upvote' | 'comment' | 'follow' | 'mention' | 'achievement';
  message: string;
  relatedRant?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['upvote', 'comment', 'follow', 'mention', 'achievement'],
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
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<INotification>('Notification', notificationSchema); 