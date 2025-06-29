import Comment from '../models/Comment.js';
import Rant from '../models/Rant.js';
import User from '../models/User.js';

export const createComment = async (req, res) => {
  try {
    const {
      text,
      parentComment,
      tags,
      mentions,
      isAnonymous,
      attachments,
      location
    } = req.body;

    const { rantId } = req.params;

    // Validate required fields
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if rant exists
    const rant = await Rant.findById(rantId);
    if (!rant || rant.isDeleted) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    // If this is a reply, check if parent comment exists
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc || parentCommentDoc.isDeleted) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      text,
      author: req.user._id,
      rant: rantId,
      parentComment,
      tags,
      mentions,
      isAnonymous,
      attachments,
      location,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    await comment.save();

    // Update rant's comment count
    rant.commentCount += 1;
    await rant.save();

    // Add points to user
    const user = await User.findById(req.user._id);
    if (user) {
      await user.addPoints(5);
      user.totalComments += 1;
      await user.save();
    }

    // Populate author and mentions
    await comment.populate('author', 'username firstName lastName displayName avatar level');
    await comment.populate('mentions', 'username firstName lastName displayName avatar');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ error: 'Error creating comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { 
      rantId, 
      parentComment = null, 
      page = 1, 
      limit = 10, 
      sort = 'recent' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    let query = { isDeleted: false };
    
    if (rantId) {
      query.rant = rantId;
    }
    if (parentComment) {
      query.parentComment = parentComment;
    } else {
      query.parentComment = null; // Only top-level comments
    }

    let sortOptions = {};
    switch (sort) {
      case 'most_liked':
        sortOptions = { likes: -1 };
        break;
      case 'most_replied':
        sortOptions = { replyCount: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const comments = await Comment.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username firstName lastName displayName avatar level')
      .populate('mentions', 'username firstName lastName displayName avatar')
      .populate('parentComment', 'text author')
      .populate('parentComment.author', 'username firstName lastName displayName avatar');

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(400).json({ error: 'Error fetching comments' });
  }
};

export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate('author', 'username firstName lastName displayName avatar level')
      .populate('mentions', 'username firstName lastName displayName avatar')
      .populate('parentComment', 'text author')
      .populate('parentComment.author', 'username firstName lastName displayName avatar')
      .populate('rant', 'text title');

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Increment view count
    comment.engagement.views += 1;
    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(400).json({ error: 'Error fetching comment' });
  }
};

export const updateComment = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['text', 'tags', 'mentions', 'attachments'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false,
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    updates.forEach(update => {
      comment[update] = req.body[update];
    });

    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    // Populate author and mentions
    await comment.populate('author', 'username firstName lastName displayName avatar level');
    await comment.populate('mentions', 'username firstName lastName displayName avatar');

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(400).json({ error: 'Error updating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false,
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Soft delete the comment
    await comment.softDelete(req.user._id);

    // Update rant's comment count
    const rant = await Rant.findById(comment.rant);
    if (rant && rant.commentCount > 0) {
      rant.commentCount -= 1;
      await rant.save();
    }

    // Update user's total comments count
    const user = await User.findById(req.user._id);
    if (user && user.totalComments > 0) {
      user.totalComments -= 1;
      await user.save();
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(400).json({ error: 'Error deleting comment' });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await comment.like(req.user._id);

    // Add points to comment author for like
    if (comment.author.toString() !== req.user._id.toString()) {
      const commentAuthor = await User.findById(comment.author);
      if (commentAuthor) {
        await commentAuthor.addPoints(1);
        commentAuthor.totalUpvotes += 1;
        await commentAuthor.save();
      }
    }

    // Populate author and mentions
    await comment.populate('author', 'username firstName lastName displayName avatar level');
    await comment.populate('mentions', 'username firstName lastName displayName avatar');

    res.json(comment);
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(400).json({ error: 'Error liking comment' });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await comment.dislike(req.user._id);

    // Populate author and mentions
    await comment.populate('author', 'username firstName lastName displayName avatar level');
    await comment.populate('mentions', 'username firstName lastName displayName avatar');

    res.json(comment);
  } catch (error) {
    console.error('Error disliking comment:', error);
    res.status(400).json({ error: 'Error disliking comment' });
  }
};

export const reportComment = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await comment.report(req.user._id, reason);

    res.json({ message: 'Comment reported successfully' });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(400).json({ error: 'Error reporting comment' });
  }
};

export const getCommentReplies = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let sortOptions = {};
    switch (sort) {
      case 'most_liked':
        sortOptions = { likes: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const replies = await Comment.find({
      parentComment: req.params.id,
      isDeleted: false,
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username firstName lastName displayName avatar level')
      .populate('mentions', 'username firstName lastName displayName avatar');

    const total = await Comment.countDocuments({
      parentComment: req.params.id,
      isDeleted: false,
    });

    res.json({
      replies,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    res.status(400).json({ error: 'Error fetching comment replies' });
  }
};

export const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({
      author: userId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username firstName lastName displayName avatar level')
      .populate('rant', 'text title')
      .populate('parentComment', 'text');

    const total = await Comment.countDocuments({
      author: userId,
      isDeleted: false,
    });

    res.json({
      comments,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(400).json({ error: 'Error fetching user comments' });
  }
}; 