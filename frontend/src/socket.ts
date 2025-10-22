import { io } from "socket.io-client";
import { dbUrl } from "./constants";

export const socket = io(dbUrl, {
  reconnectionDelayMax: 10000,
});



export const SocketEvent = {
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  JOIN_PERSONAL_CHAT: "join",
  GET_ALL_MESSAGES: "get_all_messages",
  ONLINE_USERS: "online_users",
} as const;


export type SocketEventType = typeof SocketEvent[keyof typeof SocketEvent];
