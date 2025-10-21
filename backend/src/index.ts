import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

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
  socket.on("join", () => {});
});

server.listen(port, () => {
  console.log(`server running on ${port}`);
});
