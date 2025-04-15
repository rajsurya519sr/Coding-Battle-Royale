const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

let lobby = {
  players: [],
  code: uuidv4().slice(0, 6).toUpperCase(),
  countdown: null,
  timer: 20,
  gameStarted: false,
};

io.on("connection", (socket) => {
  console.log("New player connected");

  socket.on("join_lobby", (playerName) => {
    if (lobby.players.length < 8 && !lobby.gameStarted) {
      lobby.players.push({ id: socket.id, name: playerName });
      io.emit("players_updated", lobby.players);
      io.emit("lobby_code", lobby.code);

      if (lobby.players.length >= 4 && !lobby.countdown) {
        startCountdown();
      }
    }
  });

  socket.on("disconnect", () => {
    lobby.players = lobby.players.filter((p) => p.id !== socket.id);
    io.emit("players_updated", lobby.players);
  });

  function startCountdown() {
    lobby.countdown = setInterval(() => {
      if (lobby.timer > 0) {
        lobby.timer--;
        io.emit("countdown_tick", lobby.timer);
      } else {
        clearInterval(lobby.countdown);
        lobby.gameStarted = true;
        io.emit("start_game");
      }
    }, 1000);
  }
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
