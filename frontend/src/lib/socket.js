// src/lib/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Replace with your backend URL/port

export default socket;
