// src/lib/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Add detailed logging for all socket events
socket.onAny((event, ...args) => {
  console.log(`[Socket Event] ${event}:`, ...args);
});

socket.on("connect", () => {
  console.log("[Socket] Connected with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("[Socket] Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Disconnected:", reason);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("[Socket] Reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log("[Socket] Reconnection attempt #", attemptNumber);
});

socket.on("error", (error) => {
  console.error("[Socket] Error:", error);
});

export default socket;
