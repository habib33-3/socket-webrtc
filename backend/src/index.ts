import express from "express";
import http from "http";
import cors from "cors";
import { initSocket } from "./socket/socket.ts";
import { registerSocketHandlers } from "./socket/socket-loader.ts";
import { userRouter } from "./modules/user/user.routes.ts";


const app = express();
const server = http.createServer(app);

initSocket(server);
registerSocketHandlers();

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

app.use("/user", userRouter);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`server running on ${port}`);
});
