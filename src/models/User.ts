import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  level: number;
  points: number;
  location: {
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  bio: string;
  profileImage: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  achievements: mongoose.Types.ObjectId[];
  notifications: mongoose.Types.ObjectId[];
  recentActivity: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    location: {
      city: {
        type: String,
        default: 'Unknown',
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    achievements: [{
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
    }],
    notifications: [{
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    }],
    recentActivity: [{
      type: Schema.Types.ObjectId,
      ref: 'Activity',
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema); 