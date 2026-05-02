# Denick - Project Management & Admin Dashboard

A comprehensive project management and admin dashboard built with modern web technologies.

## Features

- 📊 Project tracking and management
- 👥 Team collaboration tools
- 📈 Performance analytics
- 🎯 Task management
- 📱 Responsive design
- 🔐 Secure authentication

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Express.js, Node.js
- **Database**: MySQL
- **Deployment**: Vercel (frontend), DigitalOcean (backend)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- MySQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/hammy14/denick.git
cd denick

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# - Database credentials
# - API endpoints
# - JWT secret

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your_secret_key
API_PORT=3001
NODE_ENV=development
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy

### Backend (DigitalOcean)
1. Create DigitalOcean App Platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

## API Documentation

API endpoints are available at `/api/pt/` when the backend is running.

### Key Endpoints

- `GET /api/health` - Health check
- `GET /api/pt/projects` - List all projects
- `GET /api/pt/projects/:id` - Get project details
- `POST /api/pt/projects` - Create new project
- `GET /api/pt/tasks` - List all tasks
- `POST /api/pt/tasks` - Create new task

## Project Structure

```
denick/
├── src/
│   ├── components/
│   ├── pages/
│   ├── config/
│   └── utils/
├── public/
├── .env.example
├── package.json
└── README.md
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Author

Created by hammy14

---

**Status**: Production Ready  
**Last Updated**: May 2, 2026
