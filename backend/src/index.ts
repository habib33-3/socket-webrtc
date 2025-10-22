import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { SocketEvent } from "./events.js";
import { initSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);

initSocket(server);

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



server.listen(port, () => {
  console.log(`server running on ${port}`);
});
