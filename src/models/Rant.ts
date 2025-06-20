import mongoose, { Document, Schema } from 'mongoose';

export interface IRant extends Document {
  text: string;
  imageUrl?: string;
  author: mongoose.Types.ObjectId;
  location: {
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  comments: {
    text: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const rantSchema = new Schema<IRant>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      text: {
        type: String,
        required: true,
        trim: true,
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
rantSchema.index({ location: '2dsphere' });
rantSchema.index({ createdAt: -1 });
rantSchema.index({ upvotes: -1 });

export default mongoose.model<IRant>('Rant', rantSchema); 