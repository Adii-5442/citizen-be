import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  rant: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: mongoose.Types.ObjectId; // For threaded comments
}

const commentSchema = new Schema<IComment>({
  rant: {
    type: Schema.Types.ObjectId,
    ref: 'Rant',
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IComment>('Comment', commentSchema); 