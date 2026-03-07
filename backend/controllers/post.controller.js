const Post = require('../models/post.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Get all posts (feed)
exports.getPosts = async (req, res) => {
  try {
    // Get current user's following list
    const currentUser = await User.findById(req.userId).select('following saved').lean();
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get posts from users the current user follows (excluding own posts)
    const followingIds = currentUser.following || [];
    
    let posts;
    
    // If user is not following anyone, show 2 random posts from any user
    if (followingIds.length === 0) {
      posts = await Post.aggregate([
        { $match: { user: { $ne: req.userId } } },
        { $sample: { size: 2 } }
      ]);
      
      // Populate user data for random posts
      await Post.populate(posts, { path: 'user', select: 'username fullName avatar' });
    } else {
      posts = await Post.find({ user: { $in: followingIds } })
        .populate('user', 'username fullName avatar')
        .select('-comments')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

    // Filter out posts with null users (deleted users)
    const validPosts = posts.filter(post => post.user != null);

    const formattedPosts = validPosts.map(post => {
      const isSaved = currentUser.saved ? currentUser.saved.some(id => id.toString() === post._id.toString()) : false;
      
      return {
        id: post._id,
        userId: post.user._id,
        username: post.user.username,
        userAvatar: post.user.avatar,
        images: post.images,
        caption: post.caption,
        likes: post.likes.length,
        comments: 0,
        isLiked: post.likes.some(id => id.toString() === req.userId),
        isSaved: isSaved,
        createdAt: post.createdAt,
        tags: post.tags || []
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get posts by username
exports.getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findOne({ username }).select('_id').lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username fullName avatar')
      .select('-comments')
      .sort({ createdAt: -1 })
      .lean();

    // Get current user's saved posts
    let currentUser = null;
    if (req.userId) {
      currentUser = await User.findById(req.userId).select('saved').lean();
    }

    const formattedPosts = posts.map(post => {
      const isSaved = currentUser && currentUser.saved ? currentUser.saved.some(id => id.toString() === post._id.toString()) : false;
      
      return {
        id: post._id,
        userId: post.user._id,
        username: post.user.username,
        userAvatar: post.user.avatar,
        images: post.images,
        caption: post.caption,
        likes: post.likes.length,
        comments: 0,
        isLiked: req.userId ? post.likes.some(id => id.toString() === req.userId) : false,
        isSaved: isSaved,
        createdAt: post.createdAt,
        tags: post.tags || []
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName avatar')
      .populate('comments.user', 'username avatar');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user has saved this post
    let isSaved = false;
    if (req.userId) {
      const User = require('../models/user.model');
      const user = await User.findById(req.userId);
      isSaved = user && user.saved ? user.saved.includes(post._id.toString()) : false;
    }

    const formattedPost = {
      id: post._id,
      userId: post.user._id,
      username: post.user.username,
      userAvatar: post.user.avatar,
      images: post.images,
      caption: post.caption,
      likes: post.likes.length,
      comments: post.comments.length,
      isLiked: req.userId ? post.likes.includes(req.userId) : false,
      isSaved: isSaved,
      createdAt: post.createdAt,
      tags: post.tags || []
    };

    res.json(formattedPost);
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Get all posts for explore page
exports.getExplorePosts = async (req, res) => {
  try {
    const { tag } = req.query;
    
    let query = {};
    
    // Exclude current user's posts
    if (req.userId) {
      query.user = { $ne: req.userId };
    }
    
    // If tag is provided, filter by tag
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    const posts = await Post.find(query)
      .populate('user', 'username fullName avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // Filter out posts with null users (deleted users)
    const validPosts = posts.filter(post => post.user != null);

    // Get current user's saved posts
    let currentUser = null;
    if (req.userId) {
      currentUser = await User.findById(req.userId);
    }

    const formattedPosts = validPosts.map(post => {
      const isSaved = currentUser && currentUser.saved ? currentUser.saved.includes(post._id.toString()) : false;
      
      return {
        id: post._id,
        userId: post.user._id,
        username: post.user.username,
        userAvatar: post.user.avatar,
        images: post.images,
        caption: post.caption,
        likes: post.likes.length,
        comments: post.comments.length,
        isLiked: req.userId ? post.likes.includes(req.userId) : false,
        isSaved: isSaved,
        createdAt: post.createdAt,
        tags: post.tags || []
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get explore posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Search tags
exports.searchTags = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }
    
    // Find posts with tags matching the query
    const posts = await Post.find({
      tags: { $regex: q.toLowerCase(), $options: 'i' }
    }).select('tags');
    
    // Extract and count unique tags
    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (tag.toLowerCase().includes(q.toLowerCase())) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });
    
    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    res.json(tags);
  } catch (error) {
    console.error('Search tags error:', error);
    res.status(500).json({ error: 'Failed to search tags' });
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    const { caption, location, tags } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const githubStorage = require('../config/github');
    const images = [];
    
    for (const file of req.files) {
      try {
        const filename = `post-${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`;
        const url = await githubStorage.uploadFile(file.buffer, filename, 'posts');
        images.push(url);
      } catch (uploadError) {
        console.error('GitHub upload error for file:', file.originalname, uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload image to storage',
          details: uploadError.message 
        });
      }
    }

    // Process tags - convert to lowercase and trim
    const processedTags = tags 
      ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
      : [];

    const post = await Post.create({
      user: req.userId,
      images,
      caption,
      location,
      tags: processedTags
    });

    await post.populate('user', 'username fullName avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        userId: post.user._id,
        username: post.user.username,
        userAvatar: post.user.avatar,
        images: post.images,
        caption: post.caption,
        likes: 0,
        comments: 0,
        isLiked: false,
        isSaved: false,
        createdAt: post.createdAt,
        tags: post.tags
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Like/unlike post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.userId);
      
      // Create notification
      if (post.user.toString() !== req.userId) {
        await Notification.create({
          user: post.user,
          type: 'like',
          from: req.userId,
          post: post._id
        });
      }
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      user: req.userId,
      text
    });

    await post.save();
    await post.populate('comments.user', 'username avatar');

    // Create notification
    if (post.user.toString() !== req.userId) {
      await Notification.create({
        user: post.user,
        type: 'comment',
        from: req.userId,
        post: post._id,
        text
      });
    }

    res.json({
      message: 'Comment added',
      comments: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('comments.user', 'username avatar');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const formattedComments = post.comments.map(comment => ({
      id: comment._id,
      text: comment.text,
      user: {
        id: comment.user._id,
        username: comment.user.username,
        avatar: comment.user.avatar
      },
      createdAt: comment.createdAt
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or the post
    if (comment.user.toString() !== req.userId && post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ 
      message: 'Comment deleted successfully',
      comments: post.comments.length
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete images from GitHub storage
    const githubStorage = require('../config/github');
    for (const imageUrl of post.images) {
      try {
        // Extract filename from URL: /api/media/posts/filename.jpg
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        const filepath = `uploads/${folder}/${filename}`;
        
        await githubStorage.deleteFile(filepath);
        console.log(`Deleted image from GitHub: ${filepath}`);
      } catch (deleteError) {
        console.error('Failed to delete image from GitHub:', deleteError.message);
        // Continue even if image deletion fails
      }
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Save/Unsave post
exports.toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const postId = req.params.id;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize saved array if it doesn't exist
    if (!user.saved) {
      user.saved = [];
    }

    const savedIndex = user.saved.indexOf(postId);

    if (savedIndex > -1) {
      // Unsave
      user.saved.splice(savedIndex, 1);
    } else {
      // Save
      user.saved.push(postId);
    }

    await user.save();

    res.json({ 
      message: savedIndex > -1 ? 'Post unsaved' : 'Post saved',
      isSaved: savedIndex === -1
    });
  } catch (error) {
    console.error('Toggle save post error:', error);
    res.status(500).json({ error: 'Failed to toggle save post' });
  }
};

// Get saved posts for current user
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'saved',
      populate: {
        path: 'user',
        select: 'username fullName avatar'
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter out null posts (deleted posts)
    const validPosts = user.saved.filter(post => post != null && post.user != null);

    const formattedPosts = validPosts.map(post => ({
      id: post._id,
      userId: post.user._id,
      username: post.user.username,
      userAvatar: post.user.avatar,
      images: post.images,
      caption: post.caption,
      likes: post.likes.length,
      comments: post.comments ? post.comments.length : 0,
      isLiked: post.likes.includes(req.userId),
      isSaved: true,
      createdAt: post.createdAt,
      tags: post.tags || []
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
};
