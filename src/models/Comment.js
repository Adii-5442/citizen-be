import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rant: {
    type: Schema.Types.ObjectId,
    ref: 'Rant',
    required: true,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null, // For nested comments/replies
  },
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
      enum: ['spam', 'inappropriate', 'harassment', 'other'],
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
    },
    url: String,
    filename: String,
    size: Number,
  }],
  location: {
    city: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  anonymousId: {
    type: String,
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  },
  engagement: {
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
commentSchema.index({ rant: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ isDeleted: 1 });
commentSchema.index({ 'reportedBy.user': 1 });

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true,
});

// Virtual for total engagement
commentSchema.virtual('totalEngagement').get(function() {
  return this.likes + this.dislikes + this.engagement.views + this.engagement.shares;
});

// Method to like comment
commentSchema.methods.like = async function(userId) {
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
  
  return this.save();
};

// Method to dislike comment
commentSchema.methods.dislike = async function(userId) {
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
  
  return this.save();
};

// Method to report comment
commentSchema.methods.report = async function(userId, reason) {
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

// Method to soft delete comment
commentSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

export default mongoose.model('Comment', commentSchema); 