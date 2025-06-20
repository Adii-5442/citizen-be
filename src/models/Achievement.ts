import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

const achievementSchema = new Schema<IAchievement>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
    default: '',
  },
  criteria: {
    type: String,
    trim: true,
    default: '',
  },
});

export default mongoose.model<IAchievement>('Achievement', achievementSchema); 