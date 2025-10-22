// backend/src/socket/features/privateChat.ts
import { Server, Socket } from "socket.io";
import prisma from "../../prisma";
import { SocketEvent } from "../../events";

const ONLINE_USERS_ROOM = "ONLINE_USERS_ROOM";

// Utility to get consistent conversationId
export const getConversationId = (id1: string, id2: string) =>
  [id1, id2].sort().join("-");

export const privateChatFeature = {
  register(io: Server, socket: Socket) {
    // --- User joins online room ---
    socket.on(SocketEvent.JOIN_PERSONAL_CHAT, async (userId: string) => {
      socket.data.userId = userId;
      socket.join(ONLINE_USERS_ROOM);

      const sockets = await io.in(ONLINE_USERS_ROOM).fetchSockets();
      const onlineIds = [
        ...new Set(sockets.map((s) => s.data.userId).filter(Boolean)),
      ];
      const users = await Promise.all(
        onlineIds.map((id) => prisma.user.findUnique({ where: { id } }))
      );

      io.to(ONLINE_USERS_ROOM).emit(SocketEvent.ONLINE_USERS, users);
    });

    // --- Join conversation room ---
    socket.on(SocketEvent.JOIN_CONVERSATION, (conversationId: string) => {
      console.log(conversationId);
      socket.join(conversationId);
    });

    // --- Fetch all messages ---
    socket.on(
      SocketEvent.GET_ALL_MESSAGES,
      async ({ conversationId }, callback) => {
        try {
          const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
          });
          callback({ success: true, messages });
        } catch (err) {
          console.error(err);
          callback({ success: false, messages: [] });
        }
      }
    );

    // --- Send message ---
    // socket.on(
    //   SocketEvent.SEND_MESSAGE,
    //   async ({ senderId, receiverId, content }, callback) => {
    //     try {
    //       // Find or create conversation
    //       let conversation = await prisma.conversation.findFirst({
    //         where: {
    //           OR: [
    //             { user1Id: senderId, user2Id: receiverId },
    //             { user1Id: receiverId, user2Id: senderId },
    //           ],
    //         },
    //       });

    //       const conversationId = getConversationId(senderId, receiverId);

    //       if (!conversation) {
    //         conversation = await prisma.conversation.create({
    //           data: { user1Id: senderId, user2Id: receiverId, conversationId },
    //         });
    //       }

    //       // Auto-join sender and receiver to conversation room
    //       socket.join(conversationId);
    //       const sockets = await io.fetchSockets();
    //       sockets.forEach((s) => {
    //         if (s.data.userId === receiverId) s.join(conversationId);
    //       });

    //       // Save message
    //       const message = await prisma.message.create({
    //         data: { content, senderId, receiverId, conversationId },
    //       });

    //       io.to(conversationId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
    //       callback?.({ success: true, message, conversationId });
    //     } catch (err) {
    //       console.error(err);
    //       callback?.({ success: false, message: "Failed to send message" });
    //     }
    //   }
    // );

    // backend/src/socket/features/privateChat.ts

    // socket.on(SocketEvent.SEND_MESSAGE, async ({ senderId, receiverId, content }, callback) => {
    //   try {
    //     let conversation = await prisma.conversation.findFirst({
    //       where: {
    //         OR: [
    //           { user1Id: senderId, user2Id: receiverId },
    //           { user1Id: receiverId, user2Id: senderId },
    //         ],
    //       },
    //     });

    //     const conversationId = getConversationId(senderId, receiverId);

    //     if (!conversation) {
    //       conversation = await prisma.conversation.create({
    //         data: { user1Id: senderId, user2Id: receiverId,conversationId },
    //       });
    //     }

    //     // Auto-join sender
    //     socket.join(conversationId);

    //     // Auto-join receiver if online
    //     const allSockets = await io.fetchSockets();
    //     allSockets.forEach(s => {
    //       if (s.data.userId === receiverId) {
    //         s.join(conversationId);
    //       }
    //     });

    //     const message = await prisma.message.create({
    //       data: { content, senderId, receiverId, conversationId: conversationId },
    //     });

    //     // Emit to all users in conversation
    //     io.to(conversationId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
    //     callback?.({ success: true, message, conversationId: conversationId });
    //   } catch (err) {
    //     console.error(err);
    //     callback?.({ success: false, message: "Failed to send message" });
    //   }
    // });

    socket.on(SocketEvent.SEND_MESSAGE, async ({ senderId, receiverId, content }, callback) => {
  try {
    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });

    const conversationId = getConversationId(senderId, receiverId);

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user1Id: senderId, user2Id: receiverId, conversationId },
      });
    }

    // Save the message
    const message = await prisma.message.create({
      data: { content, senderId, receiverId, conversationId },
    });

    // Fetch all sockets
    const allSockets = await io.fetchSockets();

    // Send to receiver
    allSockets.forEach(s => {
      if (s.data.userId === receiverId) {
        s.emit(SocketEvent.RECEIVE_MESSAGE, { message });
      }
    });

    // Send to sender (copy)
    socket.emit(SocketEvent.RECEIVE_MESSAGE, { message });

    // Callback to sender
    callback?.({ success: true, message, conversationId });
  } catch (err) {
    console.error(err);
    callback?.({ success: false, message: "Failed to send message" });
  }
});

    // --- Disconnect handler ---
    socket.on("disconnect", async () => {
      const sockets = await io.in(ONLINE_USERS_ROOM).fetchSockets();
      const onlineIds = [
        ...new Set(sockets.map((s) => s.data.userId).filter(Boolean)),
      ];
      const users = await Promise.all(
        onlineIds.map((id) => prisma.user.findUnique({ where: { id } }))
      );
      io.to(ONLINE_USERS_ROOM).emit(SocketEvent.ONLINE_USERS, users);
    });
  },
};
