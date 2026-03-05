# Fluxgram Backend API

Instagram-like social media platform backend built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT)
- Posts with multiple images
- Comments and likes
- Follow/unfollow system
- Stories (24-hour expiry)
- Notifications
- User profiles
- Explore page with tags
- Private GitHub storage for images

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT authentication
- GitHub API for image storage
- Multer for file uploads

## Environment Variables

Create a `.env` file with:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production

# API URL (your deployed backend URL)
API_URL=https://your-app.vercel.app

# GitHub Storage (private repo)
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-private-repo-name
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_BRANCH=main
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Deployment to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Users
- GET `/api/users/:username` - Get user profile
- PUT `/api/users/:id` - Update profile
- POST `/api/users/:id/follow` - Follow/unfollow user
- GET `/api/users/suggestions` - Get user suggestions
- GET `/api/users/following` - Get following list

### Posts
- GET `/api/posts` - Get feed posts
- GET `/api/posts/:id` - Get single post
- GET `/api/posts/user/:username` - Get user posts
- GET `/api/posts/explore` - Get explore posts
- POST `/api/posts` - Create post
- DELETE `/api/posts/:id` - Delete post
- POST `/api/posts/:id/like` - Like/unlike post
- POST `/api/posts/:id/save` - Save/unsave post
- GET `/api/posts/saved` - Get saved posts
- POST `/api/posts/:id/comments` - Add comment
- GET `/api/posts/:id/comments` - Get comments
- DELETE `/api/posts/:id/comments/:commentId` - Delete comment

### Stories
- GET `/api/stories` - Get all stories
- POST `/api/stories` - Create story
- DELETE `/api/stories/:id` - Delete story

### Notifications
- GET `/api/notifications` - Get notifications
- PUT `/api/notifications/:id/read` - Mark as read

### Media
- GET `/api/media/:folder/:filename` - Proxy images from GitHub

## License

MIT
