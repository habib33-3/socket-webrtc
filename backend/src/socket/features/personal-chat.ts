import { Server, Socket } from "socket.io";
import {
  sendMessage,
  getMessages,
} from "../../modules/personal-chat/chat.services.ts";
import { SocketEvent } from "../../events.ts";
import {
  addUserSocket,
  removeUserSocket,
  getOnlineUserIds,
} from "./online-users";
import { getUserById } from "../../modules/user/user.services.ts"; // function to get user info

export const privateChatFeature = {
  register(io: Server, socket: Socket) {
    // --- 1. User joins chat / becomes online ---
    socket.on(SocketEvent.JOIN_PERSONAL_CHAT, async (userId: string) => {
      socket.join(userId);
      addUserSocket(userId, socket.id);

      // Broadcast full user objects
      const onlineIds = getOnlineUserIds();
      const users = await Promise.all(onlineIds.map((id) => getUserById(id)));
      io.emit(SocketEvent.ONLINE_USERS, users);
    });

    // --- 2. Fetch all messages ---
    socket.on(
      SocketEvent.GET_ALL_MESSAGES,
      async ({ conversationId }, callback) => {
        try {
          const messages = await getMessages(conversationId);

          console.log(messages)
          callback({ success: true, messages });
        } catch (err) {
          console.error(err);
          callback({ success: false, messages: [] });
        }
      }
    );

    // --- 3. Send message ---
    socket.on(
      SocketEvent.SEND_MESSAGE,
      async ({ senderId, receiverId, content }, callback?: Function) => {
        try {
          const { message, conversationId } = await sendMessage(
            senderId,
            receiverId,
            content
          );

          [senderId, receiverId].forEach((userId) => {
            const sockets = io.sockets.adapter.rooms.get(userId);
            sockets?.forEach((socketId) => {
              io.to(socketId).emit(SocketEvent.RECEIVE_MESSAGE, {
                message,
                conversationId,
              });
            });
          });

          callback?.({ success: true, message, conversationId });
        } catch (err) {
          console.error(err);
          callback?.({ success: false, message: "Failed to send message" });
        }
      }
    );

    // --- 4. Handle disconnect ---
    socket.on("disconnect", async () => {
      removeUserSocket(socket.id);

      const onlineIds = getOnlineUserIds();
      const users = await Promise.all(onlineIds.map((id) => getUserById(id)));
      io.emit(SocketEvent.ONLINE_USERS, users);
    });
  },
};
