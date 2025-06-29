import Rant from '../models/Rant.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

export const createRant = async (req, res) => {
  try {
    const {
      text,
      title,
      imageUrl,
      images,
      location,
      category,
      priority,
      tags,
      mentions,
      isAnonymous,
      attachments
    } = req.body;

    // Validate required fields
    if (!text || !location?.city) {
      return res.status(400).json({ error: 'Text and city are required' });
    }

    const rant = new Rant({
      text,
      title,
      imageUrl,
      images,
      location,
      category,
      priority,
      tags,
      mentions,
      isAnonymous,
      attachments,
      author: req.user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceInfo: {
        platform: req.get('X-Platform') || 'unknown',
        version: req.get('X-App-Version') || 'unknown',
        model: req.get('X-Device-Model') || 'unknown',
      }
    });

    await rant.save();

    // Add points to user
    const user = await User.findById(req.user._id);
    if (user) {
      await user.addPoints(10);
      user.totalRants += 1;
      await user.save();
    }

    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');

    res.status(201).json(rant);
  } catch (error) {
    console.error('Error creating rant:', error);
    res.status(400).json({ error: 'Error creating rant' });
  }
};

export const getRants = async (req, res) => {
  try {
    const { 
      sort = 'recent', 
      city, 
      category,
      status,
      priority,
      page = 1, 
      limit = 10,
      search,
      tags,
      author
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    let query = { isDeleted: false };
    
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { text: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    if (author) {
      query.author = author;
    }

    let sortOptions = {};
    switch (sort) {
      case 'trending':
        sortOptions = { trendingScore: -1 };
        break;
      case 'hot':
        sortOptions = { hotScore: -1 };
        break;
      case 'most_liked':
        sortOptions = { likes: -1 };
        break;
      case 'most_commented':
        sortOptions = { commentCount: -1 };
        break;
      case 'priority':
        sortOptions = { priority: -1, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const rants = await Rant.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation')
      .populate('mentions', 'username firstName lastName displayName avatar');

    const total = await Rant.countDocuments(query);

    res.json({
      rants,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Error fetching rants:', error);
    res.status(400).json({ error: 'Error fetching rants' });
  }
};

export const getRantById = async (req, res) => {
  try {
    const rant = await Rant.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    })
      .populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation')
      .populate('mentions', 'username firstName lastName displayName avatar');

    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    // Increment view count
    await rant.incrementView();

    res.json(rant);
  } catch (error) {
    console.error('Error fetching rant:', error);
    res.status(400).json({ error: 'Error fetching rant' });
  }
};

export const updateRant = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'text', 'title', 'imageUrl', 'images', 'category', 'priority', 
    'tags', 'mentions', 'attachments'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const rant = await Rant.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false,
    });

    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    updates.forEach(update => {
      rant[update] = req.body[update];
    });

    rant.isEdited = true;
    rant.editedAt = new Date();

    await rant.save();
    
    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');
    
    res.json(rant);
  } catch (error) {
    console.error('Error updating rant:', error);
    res.status(400).json({ error: 'Error updating rant' });
  }
};

export const deleteRant = async (req, res) => {
  try {
    const rant = await Rant.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false,
    });

    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    // Soft delete the rant
    await rant.softDelete(req.user._id);

    // Update user's total rants count
    const user = await User.findById(req.user._id);
    if (user && user.totalRants > 0) {
      user.totalRants -= 1;
      await user.save();
    }

    res.json({ message: 'Rant deleted successfully' });
  } catch (error) {
    console.error('Error deleting rant:', error);
    res.status(400).json({ error: 'Error deleting rant' });
  }
};

export const likeRant = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant || rant.isDeleted) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    await rant.like(req.user._id);

    // Add points to rant author for like
    if (rant.author.toString() !== req.user._id.toString()) {
      const rantAuthor = await User.findById(rant.author);
      if (rantAuthor) {
        await rantAuthor.addPoints(1);
        rantAuthor.totalUpvotes += 1;
        await rantAuthor.save();
      }
    }

    // Check if rant should be escalated
    await rant.escalate();

    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');
    
    res.json(rant);
  } catch (error) {
    console.error('Error liking rant:', error);
    res.status(400).json({ error: 'Error liking rant' });
  }
};

export const dislikeRant = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant || rant.isDeleted) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    await rant.dislike(req.user._id);

    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');
    
    res.json(rant);
  } catch (error) {
    console.error('Error disliking rant:', error);
    res.status(400).json({ error: 'Error disliking rant' });
  }
};

export const bookmarkRant = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant || rant.isDeleted) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    await rant.bookmark(req.user._id);

    res.json(rant);
  } catch (error) {
    console.error('Error bookmarking rant:', error);
    res.status(400).json({ error: 'Error bookmarking rant' });
  }
};

export const shareRant = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant || rant.isDeleted) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    await rant.incrementShare();

    res.json(rant);
  } catch (error) {
    console.error('Error sharing rant:', error);
    res.status(400).json({ error: 'Error sharing rant' });
  }
};

export const reportRant = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const rant = await Rant.findById(req.params.id);
    if (!rant || rant.isDeleted) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    await rant.report(req.user._id, reason);

    res.json({ message: 'Rant reported successfully' });
  } catch (error) {
    console.error('Error reporting rant:', error);
    res.status(400).json({ error: 'Error reporting rant' });
  }
};

export const getRantComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let sortOptions = {};
    switch (sort) {
      case 'most_liked':
        sortOptions = { likes: -1 };
        break;
      case 'most_replied':
        sortOptions = { replyCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const comments = await Comment.find({
      rant: req.params.id,
      isDeleted: false,
      parentComment: null // Only top-level comments
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username firstName lastName displayName avatar level')
      .populate('mentions', 'username firstName lastName displayName avatar');

    const total = await Comment.countDocuments({
      rant: req.params.id,
      isDeleted: false,
      parentComment: null
    });

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

export const getTrendingRants = async (req, res) => {
  try {
    const { city, limit = 10 } = req.query;

    let query = { isDeleted: false };
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    const rants = await Rant.find(query)
      .sort({ trendingScore: -1 })
      .limit(Number(limit))
      .populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');

    res.json(rants);
  } catch (error) {
    console.error('Error fetching trending rants:', error);
    res.status(400).json({ error: 'Error fetching trending rants' });
  }
};

export const getHotRants = async (req, res) => {
  try {
    const { city, limit = 10 } = req.query;

    let query = { isDeleted: false };
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    const rants = await Rant.find(query)
      .sort({ hotScore: -1 })
      .limit(Number(limit))
      .populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');

    res.json(rants);
  } catch (error) {
    console.error('Error fetching hot rants:', error);
    res.status(400).json({ error: 'Error fetching hot rants' });
  }
}; 