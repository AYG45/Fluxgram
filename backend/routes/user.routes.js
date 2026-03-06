const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

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

// GET /api/users/check-username/:username - Check username availability (protected)
router.get('/check-username/:username', auth, userController.checkUsername);

// GET /api/users/search - Search users (protected)
router.get('/search', auth, userController.searchUsers);

// GET /api/users/:username - Get user profile (with optional auth)
router.get('/:username', optionalAuth, userController.getProfile);

// PUT /api/users/:id - Update user profile (protected)
router.put('/:id', auth, uploadAvatar.single('avatar'), userController.updateProfile);

// POST /api/users/:id/follow - Follow/unfollow user (protected)
router.post('/:id/follow', auth, userController.toggleFollow);

// GET /api/users/suggestions/all - Get user suggestions (protected)
router.get('/suggestions/all', auth, userController.getSuggestions);

// GET /api/users/following/list - Get following users (protected)
router.get('/following/list', auth, userController.getFollowing);

module.exports = router;
