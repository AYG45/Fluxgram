const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy route to serve images from private GitHub repo
router.get('/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const githubStorage = require('../config/github');
    
    const filepath = `uploads/${folder}/${filename}`;
    
    // Get file from GitHub
    const response = await axios.get(
      `https://api.github.com/repos/${githubStorage.owner}/${githubStorage.repo}/contents/${filepath}`,
      {
        headers: {
          'Authorization': `token ${githubStorage.token}`,
          'Accept': 'application/vnd.github.v3.raw'
        },
        responseType: 'arraybuffer'
      }
    );

    // Determine content type based on file extension
    const ext = filename.split('.').pop().toLowerCase();
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    // Check if download is requested
    if (req.query.download === 'true') {
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
    }
    
    res.set('Content-Type', contentTypes[ext] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(response.data);
  } catch (error) {
    console.error('Media proxy error:', error.message);
    res.status(404).json({ error: 'Image not found' });
  }
});

module.exports = router;
