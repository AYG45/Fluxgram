const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, fullName, username, password } = req.body;

    // Validation
    if (!email || !fullName || !username || !password) {
      return res.status(400).json({ 
        error: 'Please provide all required fields' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle avatar
    let avatarUrl = null;
    if (req.file) {
      const githubStorage = require('../config/github');
      const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.${req.file.originalname.split('.').pop()}`;
      avatarUrl = await githubStorage.uploadFile(req.file.buffer, filename, 'avatars');
    } else {
      // Select random avatar from bandar folder
      const fs = require('fs');
      const path = require('path');
      const bandarPath = path.join(__dirname, '../bandar');
      
      try {
        const files = fs.readdirSync(bandarPath).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });
        
        if (files.length > 0) {
          const randomFile = files[Math.floor(Math.random() * files.length)];
          // Upload the random avatar to GitHub storage
          const githubStorage = require('../config/github');
          const fileBuffer = fs.readFileSync(path.join(bandarPath, randomFile));
          const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(randomFile)}`;
          avatarUrl = await githubStorage.uploadFile(fileBuffer, filename, 'avatars');
        } else {
          // Fallback to pravatar if no images in bandar folder
          avatarUrl = `https://i.pravatar.cc/150?u=${username}`;
        }
      } catch (err) {
        console.error('Error reading bandar folder:', err);
        // Fallback to pravatar
        avatarUrl = `https://i.pravatar.cc/150?u=${username}`;
      }
    }

    // Create user
    const user = await User.create({
      email,
      fullName,
      username,
      password: hashedPassword,
      avatar: avatarUrl
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      message: error.message 
    });
  }
};
