# Fluxgram

A modern, Instagram-like social media platform built with Angular and Node.js.

## Features

- 📸 Post photos with captions and tags
- 💬 Comments and likes
- 👥 Follow/unfollow users
- 📖 Stories (24-hour expiry)
- 🔔 Real-time notifications
- 🔍 Explore page with tag search
- 💾 Save posts
- 👤 User profiles
- 🎨 Monochrome design
- 📱 Fully responsive

## Tech Stack

### Frontend
- Angular 21
- TypeScript
- RxJS
- Standalone components

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT authentication
- GitHub API for image storage

### Deployment
- Vercel (frontend & backend)
- MongoDB Atlas (database)
- GitHub (private image storage)

## Project Structure

```
fluxgram/
├── backend/              # Node.js API
│   ├── config/          # Database & GitHub config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & upload middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Entry point
│
└── fluxgram/            # Angular frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/  # Reusable components
    │   │   ├── guards/      # Route guards
    │   │   ├── models/      # TypeScript interfaces
    │   │   ├── pages/       # Page components
    │   │   └── services/    # API services
    │   └── styles.css       # Global styles
    └── angular.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- GitHub account (for image storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fluxgram.git
cd fluxgram
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. Setup Frontend
```bash
cd fluxgram
npm install
ng serve
```

4. Visit `http://localhost:4200`

## Configuration

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup and deployment instructions.

### Backend Environment Variables
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
API_URL=http://localhost:3000
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-private-repo-name
GITHUB_TOKEN=your-github-token
GITHUB_BRANCH=main
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide to Vercel.

Quick deploy:
```bash
# Backend
cd backend
vercel --prod

# Frontend
cd fluxgram
ng build --configuration production
vercel --prod
```

## Features in Detail

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes

### Posts
- Multiple image uploads
- Captions and tags
- Like/unlike functionality
- Comment system
- Save/unsave posts
- Delete own posts

### Stories
- 24-hour auto-expiry
- Image uploads
- View all stories

### Social Features
- Follow/unfollow users
- User suggestions
- Notifications for likes, comments, follows
- User profiles with post grid

### Explore
- Discover new posts
- Search by tags
- Dynamic grid layout

### Image Storage
- Private GitHub repository storage
- Secure image proxy through backend
- Automatic cleanup on delete

## API Documentation

See [backend/README.md](backend/README.md) for API endpoints.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by Instagram
- Built with modern web technologies
- Designed for learning and portfolio purposes

## Support

For issues and questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for troubleshooting
