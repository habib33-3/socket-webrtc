import prisma from "../../prisma";

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
) => {
  // Find existing conversation between the two users
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: senderId, user2Id: receiverId },
        { user1Id: receiverId, user2Id: senderId },
      ],
    },
  });

  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { user1Id: senderId, user2Id: receiverId },
    });
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      conversationId: conversation.id,
      status: "SENT", // Optional: consider using enum MessageStatus
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  return { message, conversationId: conversation.id };
};

export const getMessages = async (conversationId: string) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }, // ensures chronological order
    include: {
      sender: true,
      receiver: true,
    },
  });
};
