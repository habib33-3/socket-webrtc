import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { SocketEvent } from "./events.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  connectionStateRecovery: {},
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

const port = process.env.PORT || 5000;

io.on("connection", (socket) => {
  socket.on(SocketEvent.JOIN_PERSONAL_CHAT, (user1Id, user2Id) => {
    const roomId = `personal-${user1Id}-${user2Id}`;
    socket.join(roomId);
    console.log(`${user1Id} and ${user2Id} are now in room: ${roomId}`);
  });
});

server.listen(port, () => {
  console.log(`server running on ${port}`);
});
