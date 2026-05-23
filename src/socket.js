

import { io } from "socket.io-client";

console.log("creating socket...");

const socket = io("http://localhost:4000", {
  withCredentials: true,
  autoConnect: false, 
  transports: ["websocket"], 
});

socket.on("connect", () => {
  console.log("CONNECTED ✅", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("SOCKET ERROR ❌", err.message);
});

export default socket;