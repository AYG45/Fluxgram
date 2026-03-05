const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { uploadAvatar } = require('../middleware/upload');

// POST /api/auth/register - Register new user with optional profile photo
router.post('/register', uploadAvatar.single('avatar'), authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/logout - Logout user
router.post('/logout', authController.logout);

module.exports = router;
