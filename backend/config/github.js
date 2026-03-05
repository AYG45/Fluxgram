const axios = require('axios');

class GitHubStorage {
  constructor() {
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.token = process.env.GITHUB_TOKEN;
    this.branch = process.env.GITHUB_BRANCH || 'main';
    this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents`;
    this.apiUrl = process.env.API_URL || 'http://localhost:3000';
  }

  async uploadFile(buffer, filename, folder) {
    try {
      const path = `uploads/${folder}/${filename}`;
      const content = buffer.toString('base64');

      await axios.put(
        `${this.baseUrl}/${path}`,
        {
          message: `Upload ${filename}`,
          content: content,
          branch: this.branch
        },
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Return URL to our backend proxy endpoint
      return `${this.apiUrl}/api/media/${folder}/${filename}`;
    } catch (error) {
      console.error('GitHub upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload to GitHub');
    }
  }

  async deleteFile(filepath) {
    try {
      // Get file SHA first
      const getResponse = await axios.get(`${this.baseUrl}/${filepath}`, {
        headers: {
          'Authorization': `token ${this.token}`
        }
      });

      const sha = getResponse.data.sha;

      // Delete the file
      await axios.delete(
        `${this.baseUrl}/${filepath}`,
        {
          data: {
            message: `Delete ${filepath}`,
            sha: sha,
            branch: this.branch
          },
          headers: {
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('GitHub delete error:', error.response?.data || error.message);
      return false;
    }
  }
}

module.exports = new GitHubStorage();
