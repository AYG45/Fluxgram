const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');
const auth = require('../middleware/auth');
const { uploadStory } = require('../middleware/upload');

// POST /api/stories - Create story (protected)
router.post('/', auth, uploadStory.single('image'), storyController.createStory);

// GET /api/stories - Get all stories (protected)
router.get('/', auth, storyController.getStories);

// POST /api/stories/:id/view - Mark story as viewed (protected)
router.post('/:id/view', auth, storyController.viewStory);

// DELETE /api/stories/:id - Delete story (protected)
router.delete('/:id', auth, storyController.deleteStory);

module.exports = router;
