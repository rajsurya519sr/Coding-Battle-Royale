// At the top of your file, outside the component
// const socket = io("http://localhost:3000", { autoConnect: true });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { nanoid } = require("nanoid");

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Vite's default port
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Separate maps for different types of data
const lobbies = new Map(); // lobbyCode -> { players: [], countdownStarted: false, timeLeft: 300 }
const playerLobbyMap = new Map(); // socketId -> lobbyCode
const playerNames = new Map(); // socketId -> name
const playerScores = new Map(); // socketId -> points
const eliminatedPlayers = new Map(); // socketId -> { name, points, eliminatedAt }

const maxPlayers = 8;
const minPlayersToStart = 4;

// Points for each level
const POINTS_PER_LEVEL = {
  1: 100,  // Level 1: RGB Color Mixer
  2: 200,  // Level 2: Music Playlist Shuffler
  3: 300   // Level 3: Network Message Router
};

// Time bonus calculation (faster submissions get more points)
const calculateTimeBonus = (timeLeft) => {
  return Math.floor(timeLeft * 10); // 10 points per second remaining
};

const generateLobbyCode = () => nanoid(6).toUpperCase();

// Helper function to get player data
const getPlayerData = (socketId) => ({
  id: socketId,
  name: playerNames.get(socketId) || 'Unknown Player',
  points: playerScores.get(socketId) || 0,
  eliminated: eliminatedPlayers.has(socketId)
});

// Helper function to get all players in a lobby
const getLobbyPlayers = (lobbyCode) => {
  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return [];
  
  return lobby.players.map(playerId => getPlayerData(playerId));
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("get_players", () => {
    console.log("Get players request from:", socket.id);
    const lobbyCode = playerLobbyMap.get(socket.id);
    
    if (lobbyCode && lobbies.has(lobbyCode)) {
      const players = getLobbyPlayers(lobbyCode);
      console.log("Sending players data:", players);
      socket.emit("players", players);
    } else {
      console.log("No lobby found for socket:", socket.id);
      socket.emit("players", []);
    }
  });

  socket.on("join_battle", (data) => {
    const { name, socketId } = typeof data === 'object' ? data : { name: data, socketId: socket.id };
    console.log("Player joining battle:", { name, socketId: socket.id });
    
    // Store player data
    const playerData = {
      id: socket.id,
      name: name,
      points: 0,
      eliminated: false
    };
    
    // Check if player is already in a lobby
    const existingLobbyCode = playerLobbyMap.get(socket.id);
    if (existingLobbyCode && lobbies.has(existingLobbyCode)) {
      const lobby = lobbies.get(existingLobbyCode);
      const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Update existing player's data
        lobby.players[playerIndex] = {
          ...lobby.players[playerIndex],
          name: name // Preserve the name
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
      (code) => lobbies.get(code).players.length < maxPlayers
    );

    if (!lobbyCode) {
      lobbyCode = generateLobbyCode();
      lobbies.set(lobbyCode, { 
        players: [], 
        countdownStarted: false,
        timeLeft: 300
      });
      console.log("Created new lobby:", lobbyCode);
    }

    // Add player to lobby
    lobbies.get(lobbyCode).players.push(playerData);
    socket.join(lobbyCode);
    playerLobbyMap.set(socket.id, lobbyCode);

    console.log("Updated lobby players:", lobbies.get(lobbyCode).players);

    // Send updated player list to all clients
    io.to(lobbyCode).emit("lobby_info", {
      lobbyCode,
      players: lobbies.get(lobbyCode).players
    });

    // Start countdown if enough players
    if (
      lobbies.get(lobbyCode).players.length >= minPlayersToStart &&
      !lobbies.get(lobbyCode).countdownStarted
    ) {
      lobbies.get(lobbyCode).countdownStarted = true;
      let timeLeft = 15;
      const interval = setInterval(() => {
        io.to(lobbyCode).emit("countdown", timeLeft);
        timeLeft--;
        if (timeLeft < 0) {
          clearInterval(interval);
          io.to(lobbyCode).emit("redirect", "/game");
          startLevelTimer(lobbyCode);
        }
      }, 1000);
    }
  });

  socket.on("submit_code", ({ code, language, level }) => {
    const lobbyCode = playerLobbyMap.get(socket.id);
    if (!lobbyCode || !lobbies.has(lobbyCode)) return;
    
    const lobby = lobbies.get(lobbyCode);
    if (!lobby.players.includes(socket.id)) return;
    
    // Calculate points
    const basePoints = POINTS_PER_LEVEL[level] || 0;
    const timeBonus = calculateTimeBonus(lobby.timeLeft);
    const totalPoints = basePoints + timeBonus;
    
    // Update player's points
    playerScores.set(socket.id, (playerScores.get(socket.id) || 0) + totalPoints);
    
    // Send updated leaderboard
    const players = getLobbyPlayers(lobbyCode);
    io.to(lobbyCode).emit("leaderboard_update", {
      players,
      submission: {
        playerId: socket.id,
        points: totalPoints,
        basePoints,
        timeBonus
      }
    });
  });

  socket.on("disconnect", () => {
    const lobbyCode = playerLobbyMap.get(socket.id);
    if (lobbyCode && lobbies.has(lobbyCode)) {
      const lobby = lobbies.get(lobbyCode);
      lobby.players = lobby.players.filter(id => id !== socket.id);
      
      if (lobby.players.length === 0) {
        lobbies.delete(lobbyCode);
      } else {
        const players = getLobbyPlayers(lobbyCode);
        io.to(lobbyCode).emit("lobby_info", { lobbyCode, players });
      }
    }
    
    playerLobbyMap.delete(socket.id);
    playerNames.delete(socket.id);
    playerScores.delete(socket.id);
    eliminatedPlayers.delete(socket.id);
    
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Function to start the level timer
function startLevelTimer(lobbyCode) {
  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return;

  const timer = setInterval(() => {
    lobby.timeLeft--;
    
    // Emit time update to all players
    io.to(lobbyCode).emit("time_update", lobby.timeLeft);

    // Stop timer when time runs out
    if (lobby.timeLeft <= 0) {
      clearInterval(timer);
      
      // Find player with lowest points
      const players = getLobbyPlayers(lobbyCode);
      const sortedPlayers = [...players].sort((a, b) => a.points - b.points);
      const eliminatedPlayer = sortedPlayers[0];

      if (eliminatedPlayer) {
        // Store eliminated player's data
        eliminatedPlayers.set(eliminatedPlayer.id, {
          name: eliminatedPlayer.name,
          points: eliminatedPlayer.points,
          eliminatedAt: Date.now()
        });

        // Remove the player from active players but keep in the leaderboard
        lobby.players = lobby.players.filter(p => p.id !== eliminatedPlayer.id);

        // Create combined leaderboard with both active and eliminated players
        const leaderboard = [
          ...lobby.players,
          ...Array.from(eliminatedPlayers.values())
        ].sort((a, b) => b.points - a.points);

        // Emit elimination event
        io.to(lobbyCode).emit("player_eliminated", {
          playerId: eliminatedPlayer.id,
          playerName: eliminatedPlayer.name,
          leaderboard: leaderboard
        });
        
        // Update the leaderboard for all players
        io.to(lobbyCode).emit("leaderboard_update", {
          players: leaderboard
        });
      }
    }
  }, 1000);
}

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
