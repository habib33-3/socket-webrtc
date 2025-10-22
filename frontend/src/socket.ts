import { io } from "socket.io-client";
import { dbUrl } from "./constants";

export const socket = io(dbUrl, {
  reconnectionDelayMax: 10000,
});

export const SocketEvent = {
  JOIN_PERSONAL_CHAT: "join_personal_chat",
  JOIN_CONVERSATION: "join_conversation",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  GET_ALL_MESSAGES: "get_all_messages",
  ONLINE_USERS: "online_users",
  JOIN: "join",
} as const;

export type SocketEventType = (typeof SocketEvent)[keyof typeof SocketEvent];

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});
socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});
socket.onAny((event, data) => {
  console.log("📡 Event:", event, data);
});
