const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const Story = require('./models/story.model');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Helper function to delete story image file
const deleteStoryFile = (imageUrl) => {
  try {
    const filename = imageUrl.split('/').pop();
    const filePath = path.join(__dirname, 'uploads/stories', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted story file: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting story file:', error);
  }
};

// Cleanup expired stories every 10 seconds
setInterval(async () => {
  try {
    // Find expired stories before deleting to get their image URLs
    const expiredStories = await Story.find({
      expiresAt: { $lt: new Date() }
    });

    if (expiredStories.length > 0) {
      // Delete image files
      expiredStories.forEach(story => {
        deleteStoryFile(story.image);
      });

      // Delete from database
      const result = await Story.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log(`Cleaned up ${result.deletedCount} expired stories and their files`);
    }
  } catch (error) {
    console.error('Story cleanup error:', error);
  }
}, 10000); // Run every 10 seconds

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable x-powered-by header for security
app.disable('x-powered-by');

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/stories', require('./routes/story.routes'));
app.use('/api/media', require('./routes/media.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fluxgram API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fluxgram API running on http://localhost:${PORT}`);
});

