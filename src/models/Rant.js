import mongoose from 'mongoose';

const { Schema } = mongoose;

const rantSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 2000,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    city: {
      type: String,
      required: true,
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
    address: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
  },
  category: {
    type: String,
    enum: [
      'infrastructure', 'transportation', 'environment', 'safety', 
      'healthcare', 'education', 'noise', 'parking', 'maintenance',
      'utilities', 'parks', 'traffic', 'pollution', 'other'
    ],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'in_progress', 'escalated', 'closed'],
    default: 'active',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Engagement metrics
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  dislikes: {
    type: Number,
    default: 0,
  },
  dislikedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  commentCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  bookmarkCount: {
    type: Number,
    default: 0,
  },
  bookmarkedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Escalation and resolution
  escalationThreshold: {
    type: Number,
    default: 50, // Number of likes needed for escalation
  },
  isEscalated: {
    type: Boolean,
    default: false,
  },
  escalatedAt: {
    type: Date,
  },
  escalatedTo: {
    department: {
      type: String,
      trim: true,
    },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    reference: String,
  },
  resolution: {
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    description: String,
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    feedback: String,
  },
  
  // Moderation and reporting
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  anonymousId: {
    type: String,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  reportedBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'false_information', 'other'],
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isModerated: {
    type: Boolean,
    default: false,
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: {
    type: Date,
  },
  moderationReason: {
    type: String,
  },
  
  // Analytics and tracking
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  },
  trendingScore: {
    type: Number,
    default: 0,
  },
  hotScore: {
    type: Number,
    default: 0,
  },
  engagementRate: {
    type: Number,
    default: 0,
  },
  
  // Technical fields
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  deviceInfo: {
    platform: String,
    version: String,
    model: String,
  },
  
  // Additional metadata
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String,
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  
  // Legacy comment field (for backward compatibility)
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
}, {
  timestamps: true,
});

// Indexes for better query performance
rantSchema.index({ location: '2dsphere' });
rantSchema.index({ createdAt: -1 });
rantSchema.index({ updatedAt: -1 });
rantSchema.index({ author: 1, createdAt: -1 });
rantSchema.index({ category: 1 });
rantSchema.index({ status: 1 });
rantSchema.index({ priority: 1 });
rantSchema.index({ 'location.city': 1 });
rantSchema.index({ likes: -1 });
rantSchema.index({ commentCount: -1 });
rantSchema.index({ trendingScore: -1 });
rantSchema.index({ hotScore: -1 });
rantSchema.index({ isEscalated: 1 });
rantSchema.index({ isDeleted: 1 });
rantSchema.index({ isModerated: 1 });
rantSchema.index({ tags: 1 });

// Virtual for total engagement
rantSchema.virtual('totalEngagement').get(function() {
  return this.likes + this.dislikes + this.commentCount + this.viewCount + this.shareCount;
});

// Virtual for engagement rate
rantSchema.virtual('calculatedEngagementRate').get(function() {
  if (this.viewCount === 0) return 0;
  return ((this.likes + this.commentCount) / this.viewCount) * 100;
});

// Virtual for time since posted
rantSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
});

// Method to like rant
rantSchema.methods.like = async function(userId) {
  const hasLiked = this.likedBy.includes(userId);
  const hasDisliked = this.dislikedBy.includes(userId);
  
  if (hasLiked) {
    // Unlike
    this.likes -= 1;
    this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
  } else {
    // Like
    this.likes += 1;
    this.likedBy.push(userId);
    
    // Remove dislike if exists
    if (hasDisliked) {
      this.dislikes -= 1;
      this.dislikedBy = this.dislikedBy.filter(id => id.toString() !== userId.toString());
    }
  }
  
  // Update trending score
  this.updateTrendingScore();
  
  return this.save();
};

// Method to dislike rant
rantSchema.methods.dislike = async function(userId) {
  const hasDisliked = this.dislikedBy.includes(userId);
  const hasLiked = this.likedBy.includes(userId);
  
  if (hasDisliked) {
    // Remove dislike
    this.dislikes -= 1;
    this.dislikedBy = this.dislikedBy.filter(id => id.toString() !== userId.toString());
  } else {
    // Dislike
    this.dislikes += 1;
    this.dislikedBy.push(userId);
    
    // Remove like if exists
    if (hasLiked) {
      this.likes -= 1;
      this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
    }
  }
  
  // Update trending score
  this.updateTrendingScore();
  
  return this.save();
};

// Method to bookmark rant
rantSchema.methods.bookmark = async function(userId) {
  const hasBookmarked = this.bookmarkedBy.includes(userId);
  
  if (hasBookmarked) {
    // Remove bookmark
    this.bookmarkCount -= 1;
    this.bookmarkedBy = this.bookmarkedBy.filter(id => id.toString() !== userId.toString());
  } else {
    // Add bookmark
    this.bookmarkCount += 1;
    this.bookmarkedBy.push(userId);
  }
  
  return this.save();
};

// Method to increment view count
rantSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  this.updateTrendingScore();
  return this.save();
};

// Method to increment share count
rantSchema.methods.incrementShare = async function() {
  this.shareCount += 1;
  this.updateTrendingScore();
  return this.save();
};

// Method to update trending score
rantSchema.methods.updateTrendingScore = function() {
  const now = new Date();
  const ageInHours = (now - this.createdAt) / (1000 * 60 * 60);
  const gravity = 1.8;
  
  this.trendingScore = (this.likes + this.commentCount * 2) / Math.pow(ageInHours + 2, gravity);
  this.hotScore = this.likes + this.commentCount * 2 + this.shareCount * 3;
};

// Method to report rant
rantSchema.methods.report = async function(userId, reason) {
  const existingReport = this.reportedBy.find(report => 
    report.user.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.reportedBy.push({
      user: userId,
      reason,
      reportedAt: new Date(),
    });
    this.reportCount += 1;
    return this.save();
  }
  
  return this;
};

// Method to escalate rant
rantSchema.methods.escalate = async function() {
  if (this.likes >= this.escalationThreshold && !this.isEscalated) {
    this.isEscalated = true;
    this.escalatedAt = new Date();
    this.status = 'escalated';
    return this.save();
  }
  return this;
};

// Method to soft delete rant
rantSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Pre-save middleware to update trending score
rantSchema.pre('save', function(next) {
  if (this.isModified('likes') || this.isModified('commentCount') || this.isModified('shareCount')) {
    this.updateTrendingScore();
  }
  next();
});

export default mongoose.model('Rant', rantSchema); 