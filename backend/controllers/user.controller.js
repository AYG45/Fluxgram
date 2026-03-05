const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -posts')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = req.userId ? user.followers.some(id => id.toString() === req.userId) : false;
    const followsYou = req.userId ? user.following.some(id => id.toString() === req.userId) : false;

    // Get post count without loading all posts
    const Post = require('../models/post.model');
    const postCount = await Post.countDocuments({ user: user._id });

    res.json({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers.length,
      following: user.following.length,
      posts: postCount,
      isFollowing,
      followsYou
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Check username availability
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      return res.json({ available: false });
    }
    
    const existingUser = await User.findOne({ username });
    res.json({ available: !existingUser });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, fullName, bio } = req.body;
    
    const updates = {};
    
    // Handle username change
    if (username) {
      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9._]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: 'Invalid username format' });
      }
      
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      
      updates.username = username;
    }
    
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    
    if (req.file) {
      const githubStorage = require('../config/github');
      
      // Get current user to delete old avatar
      const currentUser = await User.findById(req.params.id);
      
      // Delete old avatar from GitHub if it exists and is not a default avatar
      if (currentUser.avatar && !currentUser.avatar.includes('pravatar.cc')) {
        try {
          const urlParts = currentUser.avatar.split('/');
          const filename = urlParts[urlParts.length - 1];
          const folder = urlParts[urlParts.length - 2];
          const filepath = `uploads/${folder}/${filename}`;
          
          await githubStorage.deleteFile(filepath);
          console.log(`Deleted old avatar from GitHub: ${filepath}`);
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError.message);
          // Continue even if deletion fails
        }
      }
      
      // Upload new avatar
      const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.${req.file.originalname.split('.').pop()}`;
      const url = await githubStorage.uploadFile(req.file.buffer, filename, 'avatars');
      updates.avatar = url;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Follow/unfollow user
exports.toggleFollow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following.some(
      id => id.toString() === userToFollow._id.toString()
    );

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
    } else {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      // Create notification
      await Notification.create({
        user: userToFollow._id,
        type: 'follow',
        from: currentUser._id
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      isFollowing: !isFollowing,
      followers: userToFollow.followers.length
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
};

// Get suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const suggestions = await User.find({
      _id: { 
        $ne: req.userId,
        $nin: currentUser.following || []
      }
    })
    .select('username fullName avatar')
    .limit(5);

    res.json(suggestions.map(user => ({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      reason: 'Suggested for you',
      following: false
    })));
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

// Get following users
exports.getFollowing = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId)
      .populate('following', 'username fullName avatar');
    
    res.json(currentUser.following.map(user => ({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar
    })));
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to fetch following users' });
  }
};
