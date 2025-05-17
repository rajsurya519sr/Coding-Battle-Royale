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

const lobbies = {}; // { lobbyCode: { players: [], countdownStarted: false } }
const maxPlayers = 8;
const minPlayersToStart = 4;

const generateLobbyCode = () => nanoid(6).toUpperCase();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  let playerLobby = null;

  socket.on("join_battle", (name) => {
    // Find or create a lobby with space
    let lobbyCode = Object.keys(lobbies).find(
      (code) => lobbies[code].players.length < maxPlayers
    );

    if (!lobbyCode) {
      lobbyCode = generateLobbyCode();
      lobbies[lobbyCode] = { players: [], countdownStarted: false };
    }

    const player = { id: socket.id, name };
    lobbies[lobbyCode].players.push(player);
    socket.join(lobbyCode);
    playerLobby = lobbyCode;

    // Send updated lobby info
    io.to(lobbyCode).emit("lobby_info", {
      lobbyCode,
      players: lobbies[lobbyCode].players
    });

    // Start countdown if enough players
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

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      if (lobbies[lobbyCode]) {
        lobbies[lobbyCode].players = lobbies[lobbyCode].players.filter(
          (p) => p.id !== socket.id
        );
        io.to(lobbyCode).emit("lobby_info", {
          lobbyCode,
          players: lobbies[lobbyCode].players
        });
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
});

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
