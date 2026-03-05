const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const auth = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');

// Optional auth middleware - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (error) {
      // Token invalid, but continue without userId
    }
  }
  
  next();
};

// GET /api/posts - Get all posts (with optional auth)
router.get('/', optionalAuth, postController.getPosts);

// GET /api/posts/user/:username - Get posts by username (with optional auth)
router.get('/user/:username', optionalAuth, postController.getUserPosts);

// GET /api/posts/explore - Get all posts for explore page (with optional auth)
router.get('/explore', optionalAuth, postController.getExplorePosts);

// GET /api/posts/saved - Get saved posts (protected)
router.get('/saved', auth, postController.getSavedPosts);

// GET /api/posts/search/tags - Search tags
router.get('/search/tags', optionalAuth, postController.searchTags);

// POST /api/posts - Create post (protected)
router.post('/', auth, uploadPost.array('images', 10), postController.createPost);

// POST /api/posts/:id/like - Like/unlike post (protected)
router.post('/:id/like', auth, postController.toggleLike);

// POST /api/posts/:id/comment - Add comment (protected)
router.post('/:id/comment', auth, postController.addComment);

// POST /api/posts/:id/save - Save/unsave post (protected)
router.post('/:id/save', auth, postController.toggleSavePost);

// GET /api/posts/:id/comments - Get comments for a post (with optional auth)
router.get('/:id/comments', optionalAuth, postController.getComments);

// DELETE /api/posts/:id/comments/:commentId - Delete comment (protected)
router.delete('/:id/comments/:commentId', auth, postController.deleteComment);

// GET /api/posts/:id - Get single post by ID (with optional auth)
router.get('/:id', optionalAuth, postController.getPostById);

// DELETE /api/posts/:id - Delete post (protected)
router.delete('/:id', auth, postController.deletePost);

module.exports = router;
