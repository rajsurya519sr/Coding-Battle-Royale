const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const passport = require("passport");
require('dotenv').config();

// Import passport configuration
require('./src/config/passport');

// Import routes
const authRoutes = require('./src/routes/auth.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite's default port
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Import socket.io functionality from index.js
const { nanoid } = require("nanoid");

const lobbies = {}; // { lobbyCode: { players: [], countdownStarted: false } }
const playerLobbyMap = new Map(); // Keep track of which lobby each player is in
const playerDataMap = new Map(); // Keep track of player data (name, points, etc.)
const eliminatedPlayers = new Map(); // Keep track of eliminated players and their scores
const maxPlayers = 8;
const minPlayersToStart = 4;

// Points for each level
const POINTS_PER_LEVEL = {
  1: 100,  // Level 1: RGB Color Mixer
  2: 200,  // Level 2: Music Playlist Shuffler
  3: 300   // Level 3: Network Message Router
};

const generateLobbyCode = () => nanoid(6).toUpperCase();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  let playerLobby = null;

  socket.on("get_players", () => {
    console.log("Get players request from:", socket.id);
    const lobbyCode = playerLobbyMap.get(socket.id);
    if (lobbyCode && lobbies[lobbyCode]) {
      // Get all players in the lobby, including eliminated ones
      const activePlayers = lobbies[lobbyCode].players;
      const eliminatedLobbyPlayers = Array.from(eliminatedPlayers.values())
        .filter(p => playerLobbyMap.get(p.id) === lobbyCode);
      
      const allPlayers = [...activePlayers, ...eliminatedLobbyPlayers]
        .map(player => ({
          ...player,
          name: playerDataMap.get(player.id)?.name || player.name || 'Unknown Player'
        }));

      console.log("Sending complete player data:", allPlayers);
      socket.emit("players", allPlayers);
    } else {
      console.log("No lobby found for socket:", socket.id);
      socket.emit("players", []);
    }
  });

  socket.on("join_battle", (name) => {
    console.log("Player joining battle:", { name, socketId: socket.id });
    
    // Store player data
    playerDataMap.set(socket.id, { name, points: 0 });
    
    // Check if player is already in a lobby
    const existingLobbyCode = playerLobbyMap.get(socket.id);
    if (existingLobbyCode && lobbies[existingLobbyCode]) {
      const lobby = lobbies[existingLobbyCode];
      const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Update existing player's data
        lobby.players[playerIndex] = {
          ...lobby.players[playerIndex],
          name,
          points: playerDataMap.get(socket.id)?.points || 0
        };
        
        console.log("Updated existing player:", lobby.players[playerIndex]);
        io.to(existingLobbyCode).emit("lobby_info", {
          lobbyCode: existingLobbyCode,
          players: lobby.players
        });
        return;
      }
    }

    // Find or create a new lobby
    let lobbyCode = Object.keys(lobbies).find(
      (code) => lobbies[code].players.length < maxPlayers
    );

    if (!lobbyCode) {
      lobbyCode = generateLobbyCode();
      lobbies[lobbyCode] = { 
        players: [], 
        countdownStarted: false
      };
      console.log("Created new lobby:", lobbyCode);
    }

    const playerData = {
      id: socket.id,
      name,
      points: playerDataMap.get(socket.id)?.points || 0
    };
    
    lobbies[lobbyCode].players.push(playerData);
    socket.join(lobbyCode);
    playerLobby = lobbyCode;
    playerLobbyMap.set(socket.id, lobbyCode);

    console.log("Updated lobby players:", lobbies[lobbyCode].players);

    io.to(lobbyCode).emit("lobby_info", {
      lobbyCode,
      players: lobbies[lobbyCode].players
    });

    // Start game if enough players
    if (
      lobbies[lobbyCode].players.length >= minPlayersToStart &&
      !lobbies[lobbyCode].countdownStarted
    ) {
      lobbies[lobbyCode].countdownStarted = true;
      let timeLeft = 15;
      const interval = setInterval(() => {
        io.to(lobbyCode).emit("countdown", timeLeft);
        timeLeft--;
        if (timeLeft < 0) {
          clearInterval(interval);
          io.to(lobbyCode).emit("redirect", "/game");
        }
      }, 1000);
    }
  });

  // Handle code submissions
  socket.on("submit_code", ({ code, language, level }) => {
    if (!playerLobby || !lobbies[playerLobby]) return;

    const lobby = lobbies[playerLobby];
    const player = lobby.players.find(p => p.id === socket.id);
    if (!player) return;

    // Calculate points - now just base points without time bonus
    const points = POINTS_PER_LEVEL[level] || 0;

    // Update player's points in all relevant places
    player.points += points;
    const playerData = playerDataMap.get(socket.id);
    if (playerData) {
      playerData.points = (playerData.points || 0) + points;
    }

    // Sort and update the leaderboard
    const allPlayers = [
      ...lobby.players,
      ...Array.from(eliminatedPlayers.values())
        .filter(p => playerLobbyMap.get(p.id) === playerLobby)
    ].sort((a, b) => b.points - a.points);

    io.to(playerLobby).emit("leaderboard_update", {
      players: allPlayers,
      submission: {
        playerId: socket.id,
        points: points,
        basePoints: points,
        timeBonus: 0
      }
    });
  });

  // Handle level changes
  socket.on("level_change", ({ level }) => {
    if (playerLobby && lobbies[playerLobby]) {
      // Just emit the level change without timer reset
      io.to(playerLobby).emit("level_changed", { level });
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const lobbyCode = playerLobbyMap.get(socket.id);
    if (lobbyCode && lobbies[lobbyCode]) {
      console.log("Player disconnected:", socket.id);
      lobbies[lobbyCode].players = lobbies[lobbyCode].players.filter(
        (p) => p.id !== socket.id
      );
      playerLobbyMap.delete(socket.id);
      
      io.to(lobbyCode).emit("lobby_info", {
        lobbyCode,
        players: lobbies[lobbyCode].players
      });
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001; // Use port 3001 to avoid conflicts
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Authentication API available at http://localhost:${PORT}/api/auth`);
});
