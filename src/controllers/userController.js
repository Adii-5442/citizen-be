import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// Helper function to get user data without sensitive information
const getUserData = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    bio: user.bio,
    avatar: user.avatar,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    phoneNumber: user.phoneNumber,
    location: user.location,
    level: user.level,
    points: user.points,
    experience: user.experience,
    badges: user.badges,
    totalRants: user.totalRants,
    totalUpvotes: user.totalUpvotes,
    totalComments: user.totalComments,
    totalFollowers: user.totalFollowers,
    totalFollowing: user.totalFollowing,
    lastActive: user.lastActive,
    joinDate: user.joinDate,
    preferences: user.preferences,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    accountType: user.accountType,
    reputation: user.reputation,
    tags: user.tags,
    interests: user.interests,
    skills: user.skills,
    socialLinks: user.socialLinks,
    occupation: user.occupation,
    company: user.company,
    education: user.education,
    // Virtual properties
    fullName: user.fullName,
    profileCompletion: user.profileCompletion,
  };
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body)
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      user: getUserData(user),
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active
    await user.updateLastActive();

    const token = generateToken(user._id);

    res.json({
      user: getUserData(user),
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -twoFactorSecret -loginHistory -deviceTokens -moderationHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(getUserData(user));
  } catch (error) {
    res.status(400).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'firstName', 'lastName', 'displayName', 'bio', 'avatar', 
    'dateOfBirth', 'gender', 'phoneNumber', 'location',
    'preferences', 'tags', 'interests', 'skills', 
    'socialLinks', 'occupation', 'company', 'education'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is updating their own profile
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();
    res.json(getUserData(user));
  } catch (error) {
    res.status(400).json({ error: 'Error updating profile' });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (error) {
    res.status(400).json({ error: 'Error checking username' });
  }
};

// New endpoint to get current user's profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -twoFactorSecret');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(getUserData(user));
  } catch (error) {
    res.status(400).json({ error: 'Error fetching current user' });
  }
};

// New endpoint to update current user's profile
export const updateCurrentUser = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'firstName', 'lastName', 'displayName', 'bio', 'avatar', 
    'dateOfBirth', 'gender', 'phoneNumber', 'location',
    'preferences', 'tags', 'interests', 'skills', 
    'socialLinks', 'occupation', 'company', 'education'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();
    res.json(getUserData(user));
  } catch (error) {
    res.status(400).json({ error: 'Error updating profile' });
  }
}; 