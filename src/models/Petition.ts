import mongoose, { Document, Schema } from 'mongoose';

export interface IPetition extends Document {
  rant: mongoose.Types.ObjectId;
  upvoteCount: number;
  generatedAt: Date;
  sentTo: string;
  status: 'pending' | 'sent' | 'failed';
}

const petitionSchema = new Schema<IPetition>({
  rant: {
    type: Schema.Types.ObjectId,
    ref: 'Rant',
    required: true,
    unique: true,
  },
  upvoteCount: {
    type: Number,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  sentTo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
});

export default mongoose.model<IPetition>('Petition', petitionSchema); 