// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://revision-hub.onrender.com", {
  transports: ["websocket", "polling"], // fallback to polling if needed
  timeout: 10000,                       // 10s timeout for connection
  reconnectionAttempts: 5,             // try reconnecting 5 times
  reconnectionDelay: 3000,             // wait 3s between attempts
});

export default socket;
