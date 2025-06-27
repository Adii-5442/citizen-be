import Rant from '../models/Rant.js';
import User from '../models/User.js';

export const createRant = async (req, res) => {
  try {
    const rant = new Rant({
      ...req.body,
      author: req.user._id,
    });

    await rant.save();

    // Add points to user using the new method
    const user = await User.findById(req.user._id);
    if (user) {
      await user.addPoints(10);
      // Update total rants count
      user.totalRants += 1;
      await user.save();
    }

    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');

    res.status(201).json(rant);
  } catch (error) {
    res.status(400).json({ error: 'Error creating rant' });
  }
};

export const getRants = async (req, res) => {
  try {
    const { sort = 'recent', city, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (city) {
      query['location.city'] = city;
    }

    let sortOptions = {};
    if (sort === 'trending') {
      sortOptions = { upvotes: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const rants = await Rant.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation')
      .populate('comments.author', 'username firstName lastName displayName avatar');

    const total = await Rant.countDocuments(query);

    res.json({
      rants,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(400).json({ error: 'Error fetching rants' });
  }
};

export const getRantById = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id)
      .populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation')
      .populate('comments.author', 'username firstName lastName displayName avatar');

    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    res.json(rant);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching rant' });
  }
};

export const updateRant = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['text', 'imageUrl'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const rant = await Rant.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    updates.forEach(update => {
      rant[update] = req.body[update];
    });

    await rant.save();
    
    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');
    
    res.json(rant);
  } catch (error) {
    res.status(400).json({ error: 'Error updating rant' });
  }
};

export const deleteRant = async (req, res) => {
  try {
    const rant = await Rant.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    // Update user's total rants count
    const user = await User.findById(req.user._id);
    if (user && user.totalRants > 0) {
      user.totalRants -= 1;
      await user.save();
    }

    res.json(rant);
  } catch (error) {
    res.status(400).json({ error: 'Error deleting rant' });
  }
};

export const upvoteRant = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    const hasUpvoted = rant.upvotedBy.includes(req.user._id);
    if (hasUpvoted) {
      rant.upvotes -= 1;
      rant.upvotedBy = rant.upvotedBy.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      rant.upvotes += 1;
      rant.upvotedBy.push(req.user._id);
      
      // Add points to rant author for upvote
      const rantAuthor = await User.findById(rant.author);
      if (rantAuthor) {
        await rantAuthor.addPoints(1);
        rantAuthor.totalUpvotes += 1;
        await rantAuthor.save();
      }
    }

    await rant.save();
    
    // Populate author with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');
    
    res.json(rant);
  } catch (error) {
    res.status(400).json({ error: 'Error upvoting rant' });
  }
};

export const addComment = async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant) {
      return res.status(404).json({ error: 'Rant not found' });
    }

    rant.comments.push({
      text: req.body.text,
      author: req.user._id,
      createdAt: new Date(),
    });

    await rant.save();

    // Add points to user using the new method
    const user = await User.findById(req.user._id);
    if (user) {
      await user.addPoints(5);
      user.totalComments += 1;
      await user.save();
    }

    // Populate author and comments with enhanced user data
    await rant.populate('author', 'username level firstName lastName displayName avatar totalRants totalUpvotes totalComments reputation');
    await rant.populate('comments.author', 'username firstName lastName displayName avatar');

    res.json(rant);
  } catch (error) {
    res.status(400).json({ error: 'Error adding comment' });
  }
}; 