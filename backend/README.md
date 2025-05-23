# Coding Battle Royale - Backend Authentication System

This is the backend authentication system for the Coding Battle Royale multiplayer game.

## Features

- 🔐 JWT-based authentication
- 📧 Email/password signup and login
- 🔄 Password hashing with bcrypt
- 🔑 OAuth authentication with Google and GitHub
- 🛡️ Protected routes with JWT middleware
- 🧑‍💻 User profile endpoint
- 🗄️ PostgreSQL database with Prisma ORM

## Setup

1. Create a PostgreSQL database for the application
2. Copy `.env.example` to `.env` and update the environment variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/coding_battle_royale?schema=public"
   JWT_SECRET="your-jwt-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   FRONTEND_URL="http://localhost:5173"
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Generate Prisma client:
   ```
   npx prisma generate
   ```
5. Run database migrations:
   ```
   npx prisma migrate dev
   ```
6. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user with email and password
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth flow
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current authenticated user (protected route)

## OAuth Configuration

To use OAuth authentication, you need to:

1. Create OAuth applications in Google and GitHub developer consoles
2. Set the callback URLs to:
   - Google: `http://localhost:3000/api/auth/google/callback`
   - GitHub: `http://localhost:3000/api/auth/github/callback`
3. Add the client IDs and secrets to your `.env` file
