<div align="center">

# 🎮 Coding Battle Royale
## AI-Driven Multiplayer Competitive Coding Game

[![React](https://img.shields.io/badge/React-18+-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini API](https://img.shields.io/badge/Gemini-API-orange?logo=google&logoColor=white)](https://ai.google.dev/)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

*A real-time multiplayer competitive coding platform with AI-driven challenge generation, live leaderboards, and intelligent feedback system.*

[Live Demo](https://coding-battle-royale.vercel.app) • [Report Bug](https://github.com/rajsurya519sr/Coding-Battle-Royale/issues) • [Request Feature](https://github.com/rajsurya519sr/Coding-Battle-Royale/issues) • [Research Paper](#publications)

</div>

---

## 🌟 Highlights

- ⚡ **Real-Time WebSocket Architecture** - Seamless multiplayer experience with instant synchronization
- 🤖 **AI-Generated Challenges** - Dynamic coding challenges powered by Google Gemini API
- 🏆 **Live Leaderboards** - Real-time ranking system with persistent statistics
- 💬 **Real-Time AI Feedback** - Instant code evaluation and intelligent suggestions
- 💨 **Smart Matchmaking** - Algorithm-based player pairing for balanced competition
- 📊 **Advanced Analytics** - Detailed performance metrics and game statistics
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access

---

## 🎉 Features

### Core Gaming
- Real-time multiplayer battles with 2-8 players
- AI-generated coding challenges of varying difficulty levels
- Time-based competitive rounds
- Automatic code execution and validation
- Performance scoring algorithm

### AI Integration
- Google Gemini API for dynamic challenge generation
- Real-time code analysis and feedback
- Adaptive difficulty based on player skill
- Natural language problem descriptions
- Intelligent hint generation

### User Experience
- Interactive code editor with syntax highlighting
- Real-time player status monitoring
- Animated leaderboard updates
- Game statistics and achievements
- User profile management
- Match history and replays

### Backend Features
- PostgreSQL database with optimized queries
- WebSocket support for real-time communication
- RESTful API for non-real-time operations
- Rate limiting and security measures
- Caching mechanisms for performance

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+
PostgreSQL 14+
Google Gemini API Key
Git
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajsurya519sr/Coding-Battle-Royale.git
   cd Coding-Battle-Royale
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   npm run setup-db
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend API URL
   npm start
   ```

4. **Access the application**
   ```
   Frontend: http://localhost:3000
   Backend: http://localhost:5000
   ```

---

## 💼 Tech Stack

### Frontend
- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **Real-Time Communication**: Socket.io Client
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Real-Time**: Socket.io
- **Authentication**: JWT
- **AI Integration**: Google Gemini API
- **Validation**: Joi

### DevOps & Deployment
- **Version Control**: Git & GitHub
- **Deployment**: Vercel (Frontend), Cloud providers (Backend)
- **Database Hosting**: Managed PostgreSQL
- **Containerization**: Docker (optional)

---

## 📊 Project Structure

```
Coding-Battle-Royale/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── socket/
│   │   ├─┠ utils/
│   │   └── app.js
│   └── package.json
└── docker-compose.yml
```

---

## 🏧 Usage

### For Players

1. **Sign Up** - Create an account
2. **Dashboard** - View available games and leaderboards
3. **Join Game** - Enter a multiplayer battle
4. **Code** - Solve the AI-generated challenge
5. **Submit** - Submit your solution
6. **Compete** - Battle against other players in real-time
7. **Review** - Check AI feedback and learn

### API Endpoints

```
Authentication:
POST   /api/auth/register         - User registration
POST   /api/auth/login            - User login
POST   /api/auth/refresh          - Refresh JWT token

Games:
GET    /api/games                 - List available games
POST   /api/games/create          - Create new game
GET    /api/games/:id             - Get game details

Challenges:
GET    /api/challenges            - List challenges
GET    /api/challenges/:id        - Get challenge details
POST   /api/challenges/generate   - Generate AI challenge

Leaderboard:
GET    /api/leaderboard           - Get global leaderboard
GET    /api/leaderboard/friends   - Get friends leaderboard

User:
GET    /api/users/profile         - Get user profile
PUT    /api/users/profile         - Update user profile
GET    /api/users/stats           - Get user statistics
```

---

## 🏆 WebSocket Events

```javascript
// Client -> Server
emit('join-game', { gameId, userId })
emit('submit-code', { gameId, code, language })
emit('request-hint', { challengeId })

// Server -> Client
on('player-joined', { playerId, playerName })
on('code-submitted', { playerId, status, score })
on('leaderboard-update', { rankings })
on('game-ended', { winner, finalScores })
```

---

## 📚 Key Functionalities

### 1. Challenge Generation
```javascript
// Example: Generate a challenge
const challenge = await geminiAPI.generateChallenge({
  difficulty: 'medium',
  topic: 'arrays',
  timeLimit: 300
});
```

### 2. Real-Time Code Execution
- Sandbox environment for safe code execution
- Multi-language support (JavaScript, Python, Java)
- Automated test case validation
- Performance metrics collection

### 3. Matchmaking Algorithm
- Skill-based player pairing
- Win-rate consideration
- Latency optimization
- Balanced team formation

### 4. Scoring System
- Time-based score adjustment
- Code efficiency rating
- Test case pass percentage
- Competitive ranking

---

## 🗒️ Configuration

Create a `.env` file in both frontend and backend directories:

### Backend .env
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/cbr
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
SOCKET_PORT=5001
```

### Frontend .env
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5001
```

---

## 👋 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📅 Publications

**Research Paper**: "Coding Battle Royale: A Multiplayer Competitive Coding Game Using AI"
- Published in: International Conference on Innovative Computing Technologies and Applications (ICICTA), 2025
- Authors: Surya Raj
- [Read Paper](#)

---

## 🙋 Support

If you found this project helpful, please consider:
- ⭐ Starring the repository
- 📏 Sharing with others
- 📜 Citing in your research
- 💬 Providing feedback

---

## 👤 Authors

**Surya Raj**
- GitHub: [@rajsurya519sr](https://github.com/rajsurya519sr)
- LinkedIn: [Surya Raj](http://in/suryaraj)
- Email: rajsurya519sr@gmail.com

---

<div align="center">

**Made with ❤️ by [Surya Raj](https://github.com/rajsurya519sr)**

[Back to top](#coding-battle-royale)

</div>
