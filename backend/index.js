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

// Add middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import passport configuration
const passport = require('./src/config/passport');

// Import authentication routes
const authRoutes = require('./src/routes/auth.routes');

// Initialize Passport middleware
app.use(passport.initialize());

// Use authentication routes
app.use('/api/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Global variables for lobby management
const lobbies = {}; // { lobbyCode: { players: [], countdownStarted: false } }
const playerLobbyMap = new Map(); // Keep track of which lobby each player is in
const playerDataMap = new Map(); // Keep track of player data (name, points, etc.)
const eliminatedPlayers = new Map(); // Keep track of eliminated players and their scores

// Configuration constants
const maxPlayers = 8;
const minPlayersToStart = 4;

// Points for each level
const POINTS_PER_LEVEL = {
  1: 100,  // Level 1: RGB Color Mixer
  2: 200,  // Level 2: Music Playlist Shuffler
  3: 300   // Level 3: Network Message Router
};

// IMPORTANT: We'll use a single active lobby for all players until it's full
let activeLobbyCode = Math.floor(100000 + Math.random() * 900000).toString();
lobbies[activeLobbyCode] = { players: [], countdownStarted: false };
console.log(`Created initial active lobby: ${activeLobbyCode}`);

// Generate a 6-digit numeric lobby code
const generateLobbyCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Set up a periodic broadcast of lobby information to ensure all clients are in sync
setInterval(() => {
  // For each active lobby
  Object.keys(lobbies).forEach(lobbyCode => {
    const lobby = lobbies[lobbyCode];
    if (lobby.players.length > 0) {
      // Make sure all players have the latest data
      const updatedPlayers = lobby.players.map(player => {
        // Get the complete player data from our map
        const playerData = playerDataMap.get(player.id);
        
        // Prioritize database name for authenticated users
        let displayName = player.name;
        
        if (playerData) {
          // If player is a database user, always use their database name
          if (playerData.isDbUser && playerData.databaseName) {
            displayName = playerData.databaseName;
            console.log(`[Sync] Using database name for player ${player.id}: ${displayName}`);
          } 
          // If player is authenticated but not from database, use stored name
          else if (playerData.isAuthenticated) {
            displayName = playerData.name;
            console.log(`[Sync] Using authenticated name for player ${player.id}: ${displayName}`);
          }
          // Otherwise use the stored name
          else {
            displayName = playerData.name;
            console.log(`[Sync] Using regular name for player ${player.id}: ${displayName}`);
          }
          
          // Debug: Log the raw player data
          if (playerData._debug_user) {
            console.log(`[Sync] Debug user data for ${player.id}:`, playerData._debug_user);
          }
        }
        
        return {
          ...player,
          name: displayName || player.name || 'Unknown Player',
          isAuthenticated: playerData?.isAuthenticated || false,
          userId: playerData?.userId || null
        };
      });
      
      // Update the lobby with the latest player data
      lobbies[lobbyCode].players = updatedPlayers;
      
      // Broadcast to all players in the lobby
      io.to(lobbyCode).emit("lobby_info", {
        lobbyCode,
        players: updatedPlayers
      });
      
      console.log(`[Sync] Broadcasting lobby ${lobbyCode} with ${updatedPlayers.length} players:`,
        updatedPlayers.map(p => `${p.name}${p.isAuthenticated ? ' (Authenticated)' : ''}`))
    }
  });
}, 3000); // Update every 3 seconds

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  let playerLobby = null;

  socket.on("get_players", () => {
    console.log("Get players request from:", socket.id);
    const lobbyCode = playerLobbyMap.get(socket.id);
    if (lobbyCode && lobbies[lobbyCode]) {
      const allPlayers = lobbies[lobbyCode].players.map(player => {
        const playerData = playerDataMap.get(player.id);
        let displayName = player.name;

        if (playerData) {
          // If player is a database user, use their database name
          if (playerData.isDbUser && playerData.databaseName) {
            displayName = playerData.databaseName;
          } 
          // If player is authenticated or has a stored name, use that
          else if (playerData.name) {
            displayName = playerData.name;
          }
        }

        return {
          ...player,
          name: displayName || player.name || 'Unknown Player',
          points: playerData?.points || 0,
          eliminated: eliminatedPlayers.has(player.id)
        };
      });

      console.log("Sending complete player data:", allPlayers);
      socket.emit("players", allPlayers);
    } else {
      console.log("No lobby found for socket:", socket.id);
      socket.emit("players", []);
    }
  });

  socket.on("join_battle", (data) => {
    // Handle both formats: string name or object with name and joinExisting
    let playerName;
    let joinExisting = true; // Default to joining existing lobbies
    let isAuthenticated = false;
    let isDbUser = false;
    let userId = null;
    let debugUser = null;
    
    if (typeof data === 'object') {
      playerName = data.name;
      joinExisting = data.joinExisting !== false; // Default to true if not specified
      isAuthenticated = !!data.isAuthenticated;
      isDbUser = !!data.isDbUser;
      userId = data.userId || null;
      debugUser = data._debug_user || null;
      
      // Log the complete data object for debugging
      console.log("COMPLETE JOIN DATA:", JSON.stringify(data, null, 2));
    } else {
      playerName = data; // Backward compatibility
    }
    
    console.log("Player joining battle:", { 
      name: playerName, 
      socketId: socket.id, 
      joinExisting,
      isAuthenticated,
      isDbUser,
      userId,
      hasDebugUser: !!debugUser
    });
    
    // For database users, ensure we use their actual database name
    const finalName = isDbUser && debugUser && debugUser.name ? debugUser.name : playerName;
    
    console.log("FINAL NAME BEING USED:", finalName, "(Database user: " + isDbUser + ")");
    
    // Check if player is already in a lobby
    const existingLobbyCode = playerLobbyMap.get(socket.id);
    if (existingLobbyCode && lobbies[existingLobbyCode]) {
      const lobby = lobbies[existingLobbyCode];
      const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Update existing player's data but keep their unique name
        const existingName = lobby.players[playerIndex].name;
        lobby.players[playerIndex] = {
          ...lobby.players[playerIndex],
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

    // Use the active lobby if it has space, otherwise create a new one
    let lobbyCode = activeLobbyCode;
    
    // Check if active lobby is full
    if (lobbies[activeLobbyCode].players.length >= maxPlayers) {
      // Create a new active lobby
      activeLobbyCode = generateLobbyCode();
      lobbies[activeLobbyCode] = { 
        players: [], 
        countdownStarted: false
      };
      lobbyCode = activeLobbyCode;
      console.log("Active lobby full, created new lobby:", lobbyCode);
    } else {
      console.log("Joining existing active lobby:", lobbyCode);
    }

    // Create player data with the correct name from database if available
    let uniqueName = finalName;
    let nameCounter = 1;
    
    // Check if name already exists in the lobby
    while (lobbies[lobbyCode].players.some(p => p.name === uniqueName)) {
      uniqueName = `${finalName}${nameCounter}`;
      nameCounter++;
    }
    
    // Store player data with authentication information
    playerDataMap.set(socket.id, { 
      name: uniqueName, // Use the unique name
      points: 0,
      isAuthenticated,
      isDbUser,
      userId,
      // Store the original database name to ensure it's preserved
      databaseName: isDbUser ? finalName : null,
      // Store debug info
      _debug_user: debugUser,
      // Store original name for reference
      originalName: finalName
    });
    
    const playerData = {
      id: socket.id,
      name: uniqueName, // Use the unique name
      points: playerDataMap.get(socket.id)?.points || 0,
      isAuthenticated: isDbUser,
      isDbUser: isDbUser,
      userId: userId
    };
    
    console.log("Adding player to lobby with unique name:", playerData.name, 
      "(Database user: " + isDbUser + ")");
    
    lobbies[lobbyCode].players.push(playerData);
    socket.join(lobbyCode);
    playerLobby = lobbyCode;
    playerLobbyMap.set(socket.id, lobbyCode);

    console.log("Updated lobby players:", lobbies[lobbyCode].players);

    // Make sure all players have the latest data before broadcasting
    const updatedPlayers = lobbies[lobbyCode].players.map(player => {
      // Get the complete player data from our map
      const playerData = playerDataMap.get(player.id);
      
      // Prioritize database name for authenticated users
      let displayName = player.name;
      
      if (playerData) {
        // If player is a database user, always use their database name
        if (playerData.isDbUser && playerData.databaseName) {
          displayName = playerData.databaseName;
          console.log(`Using database name for player ${player.id}: ${displayName}`);
        } 
        // If player is authenticated but not from database, use stored name
        else if (playerData.isAuthenticated) {
          displayName = playerData.name;
          console.log(`Using authenticated name for player ${player.id}: ${displayName}`);
        }
        // Otherwise use the stored name
        else {
          displayName = playerData.name;
          console.log(`Using regular name for player ${player.id}: ${displayName}`);
        }
        
        // Debug: Log the raw player data
        if (playerData._debug_user) {
          console.log(`Debug user data for ${player.id}:`, playerData._debug_user);
        }
      }
      
      return {
        ...player,
        name: displayName || player.name || 'Unknown Player',
        isAuthenticated: playerData?.isAuthenticated || false,
        isDbUser: playerData?.isDbUser || false,
        userId: playerData?.userId || null
      };
    });
    
    // Update the lobby with the latest player data
    lobbies[lobbyCode].players = updatedPlayers;
    
    // Broadcast to ALL players in the lobby
    io.to(lobbyCode).emit("lobby_info", {
      lobbyCode,
      players: updatedPlayers
    });
    
    // Log the updated player list with authentication status
    console.log(`Broadcasting lobby ${lobbyCode} with ${updatedPlayers.length} players:`, 
      updatedPlayers.map(p => `${p.name}${p.isAuthenticated ? ' (Authenticated)' : ''}`));
    
    // Check if we should start countdown (4+ players)
    if (
      lobbies[lobbyCode].players.length >= minPlayersToStart &&
      !lobbies[lobbyCode].countdownStarted
    ) {
      console.log(`Auto-triggering countdown check for lobby ${lobbyCode} with ${lobbies[lobbyCode].players.length} players`);
      // This will be handled by the start_countdown event handler
    }
  });

  // Handle set_lobby_code event
  socket.on("set_lobby_code", (lobbyCode) => {
    const currentLobbyCode = playerLobbyMap.get(socket.id);
    if (!currentLobbyCode || !lobbies[currentLobbyCode]) {
      console.log("Player not in a lobby, cannot set lobby code");
      return;
    }
    
    // Generate a new 6-digit numeric code if needed
    const newCode = typeof lobbyCode === 'string' && lobbyCode.length === 6 && /^\d+$/.test(lobbyCode)
      ? lobbyCode
      : Math.floor(100000 + Math.random() * 900000).toString();
      
    console.log(`Changing lobby code from ${currentLobbyCode} to ${newCode}`);
    
    // Create a new lobby with the same players
    lobbies[newCode] = {
      ...lobbies[currentLobbyCode],
      players: [...lobbies[currentLobbyCode].players]
    };
    
    // Update all players to the new lobby code
    const players = lobbies[currentLobbyCode].players;
    players.forEach(player => {
      // Update the player's lobby map
      playerLobbyMap.set(player.id, newCode);
      
      // Make the socket join the new room
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket) {
        playerSocket.leave(currentLobbyCode);
        playerSocket.join(newCode);
      }
    });
    
    // Broadcast the new lobby info
    io.to(newCode).emit("lobby_info", {
      lobbyCode: newCode,
      players: lobbies[newCode].players
    });
    
    // Delete the old lobby
    delete lobbies[currentLobbyCode];
  });
  
  // Handle start_countdown event
  socket.on("start_countdown", () => {
    const lobbyCode = playerLobbyMap.get(socket.id);
    if (!lobbyCode || !lobbies[lobbyCode]) {
      console.log("Player not in a lobby, cannot start countdown");
      return;
    }
    
    if (lobbies[lobbyCode].players.length >= minPlayersToStart && !lobbies[lobbyCode].countdownStarted) {
      console.log(`Starting countdown for lobby ${lobbyCode} with ${lobbies[lobbyCode].players.length} players`);
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
    } else {
      console.log(`Not starting countdown for lobby ${lobbyCode}: ${lobbies[lobbyCode].players.length} players, countdownStarted: ${lobbies[lobbyCode].countdownStarted}`);
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

server.listen(3001, () => {
  console.log("Server listening on http://localhost:3001");
});
