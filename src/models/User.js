import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema({
  // Basic Authentication
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
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

  // Personal Information
  firstName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  avatar: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  phoneNumber: {
    type: String,
    trim: true,
  },

  // Location & Address
  location: {
    city: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    timezone: {
      type: String,
      trim: true,
    },
  },

  // Gamification & Progress
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    icon: String,
  }],

  // Activity & Engagement
  totalRants: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalUpvotes: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalComments: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalFollowers: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalFollowing: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },

  // Social Features
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Preferences & Settings
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      mentions: {
        type: Boolean,
        default: true,
      },
      upvotes: {
        type: Boolean,
        default: true,
      },
      comments: {
        type: Boolean,
        default: true,
      },
      followers: {
        type: Boolean,
        default: true,
      },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public',
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showLocation: {
        type: Boolean,
        default: true,
      },
      showActivity: {
        type: Boolean,
        default: true,
      },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    language: {
      type: String,
      default: 'en',
    },
  },

  // Verification & Security
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
  },
  banExpires: {
    type: Date,
  },
  accountType: {
    type: String,
    enum: ['free', 'premium', 'admin', 'moderator'],
    default: 'free',
  },

  // Analytics & Tracking
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
    location: String,
  }],
  deviceTokens: [{
    token: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  }],

  // Future-Ready Fields
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  interests: [{
    type: String,
    trim: true,
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
  }],

  // Social Media Links
  socialLinks: {
    twitter: String,
    facebook: String,
    instagram: String,
    linkedin: String,
    website: String,
  },

  // Professional Info
  occupation: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    year: Number,
  }],

  // Community & Moderation
  reputation: {
    type: Number,
    default: 0,
  },
  moderationHistory: [{
    action: {
      type: String,
      enum: ['warning', 'suspension', 'ban', 'restriction'],
    },
    reason: String,
    moderator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    expires: Date,
  }],

}, {
  timestamps: true,
});

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ level: -1 });
userSchema.index({ points: -1 });
userSchema.index({ totalRants: -1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ isActive: 1 });
userSchema.index({ accountType: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.displayName || this.username;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const fields = [
    'firstName', 'lastName', 'bio', 'avatar', 'dateOfBirth',
    'phoneNumber', 'location.city', 'location.country'
  ];
  const completed = fields.filter(field => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj?.[key], this)
      : this[field];
    return value && value.toString().trim() !== '';
  }).length;
  return Math.round((completed / fields.length) * 100);
});

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Method to add points
userSchema.methods.addPoints = function(points) {
  this.points += points;
  this.experience += points;
  
  // Level up logic
  const newLevel = Math.floor(this.experience / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }
  
  return this.save();
};

// Method to follow user
userSchema.methods.followUser = async function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    await this.save();
  }
  return this;
};

// Method to unfollow user
userSchema.methods.unfollowUser = async function(userId) {
  this.following = this.following.filter(id => id.toString() !== userId.toString());
  await this.save();
  return this;
};

// Method to block user
userSchema.methods.blockUser = async function(userId) {
  if (!this.blockedUsers.includes(userId)) {
    this.blockedUsers.push(userId);
    // Also unfollow if following
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    await this.save();
  }
  return this;
};

// Method to unblock user
userSchema.methods.unblockUser = async function(userId) {
  this.blockedUsers = this.blockedUsers.filter(id => id.toString() !== userId.toString());
  await this.save();
  return this;
};

export default mongoose.model('User', userSchema);