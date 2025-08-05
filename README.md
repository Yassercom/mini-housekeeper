# Mini Housekeeper

A full-stack web application for managing household tasks and services.

## Project Structure

```
mini-housekeeper/
├── client/          # React frontend (Vite + TypeScript + Tailwind CSS)
├── server/          # Node.js backend (Express + PostgreSQL)
├── package.json     # Root workspace configuration
└── README.md
```

## Tech Stack

### Frontend (Client)
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Backend (Server)
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **ES Modules** - Modern JavaScript modules

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or pnpm

### Installation

1. Install dependencies for all workspaces:
```bash
npm install
```

2. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
```

3. Start development servers:
```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:client  # Client on http://localhost:3000
npm run dev:server  # Server on http://localhost:5000
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/db-test` - Database connection test

## Development

The project uses npm workspaces for monorepo management. Each workspace (client/server) has its own package.json and can be developed independently.

### Client Development
```bash
cd client
npm run dev     # Start dev server
npm run build   # Build for production
npm run lint    # Run ESLint
```

### Server Development
```bash
cd server
npm run dev     # Start with nodemon
npm start       # Start production server
```

## Database Setup

1. Create a PostgreSQL database named `mini_housekeeper`
2. Update the `.env` file in the server directory with your database credentials
3. The server will automatically test the connection on startup
