const Story = require('../models/story.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

// Helper function to delete story image file
const deleteStoryFile = (imageUrl) => {
  try {
    const filename = imageUrl.split('/').pop();
    const filePath = path.join(__dirname, '../uploads/stories', filename);
    
    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted story file: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting story file:', error);
  }
};

// Create story
exports.createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const image = `${req.protocol}://${req.get('host')}/uploads/stories/${req.file.filename}`;

    // Stories expire after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const story = await Story.create({
      user: req.userId,
      image,
      expiresAt
    });

    await story.populate('user', 'username fullName avatar');

    // Schedule manual deletion after 10 minutes (backup to TTL)
    setTimeout(async () => {
      try {
        const storyToDelete = await Story.findById(story._id);
        if (storyToDelete) {
          deleteStoryFile(storyToDelete.image);
          await Story.findByIdAndDelete(story._id);
          console.log(`Story ${story._id} manually deleted after 10 minutes`);
        }
      } catch (error) {
        console.error('Failed to manually delete story:', error);
      }
    }, 10 * 60 * 1000);

    res.status(201).json({
      message: 'Story created successfully',
      story: {
        id: story._id,
        userId: story.user._id,
        username: story.user.username,
        userAvatar: story.user.avatar,
        image: story.image,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        hasViewed: false
      }
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
};

// Get all stories (from following users + own stories)
exports.getStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get stories from users the current user follows + their own stories
    const userIds = [...currentUser.following, req.userId];

    const stories = await Story.find({
      user: { $in: userIds },
      expiresAt: { $gt: new Date() } // Only get non-expired stories
    })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });

    // Group stories by user
    const groupedStories = {};
    
    stories.forEach(story => {
      const userId = story.user._id.toString();
      
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          userId: story.user._id,
          username: story.user.username,
          userAvatar: story.user.avatar,
          stories: []
        };
      }

      // Check if current user has viewed this story
      const hasViewed = story.viewers.some(v => v.user.toString() === req.userId);

      groupedStories[userId].stories.push({
        id: story._id,
        image: story.image,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        hasViewed
      });
    });

    // Convert to array and determine if user has viewed all stories
    const result = Object.values(groupedStories).map(group => ({
      ...group,
      hasViewed: group.stories.every(s => s.hasViewed)
    }));

    res.json(result);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

// Mark story as viewed
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if user already viewed this story
    const alreadyViewed = story.viewers.some(v => v.user.toString() === req.userId);

    if (!alreadyViewed) {
      story.viewers.push({
        user: req.userId,
        viewedAt: new Date()
      });
      await story.save();
    }

    res.json({ message: 'Story viewed' });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ error: 'Failed to mark story as viewed' });
  }
};

// Delete story
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (story.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete the image file
    deleteStoryFile(story.image);

    await story.deleteOne();

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
};
