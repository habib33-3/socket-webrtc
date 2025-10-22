import prisma from "../../prisma";
import { getConversationId } from "../../socket/features/personal-chat";

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
) => {

  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: senderId, user2Id: receiverId },
        { user1Id: receiverId, user2Id: senderId },
      ],
    },
  });

 const conversationId=getConversationId(senderId,receiverId)

  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { user1Id: senderId, user2Id: receiverId ,conversationId},
    });
  }


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
    orderBy: { createdAt: "asc" }, 
    include: {
      sender: true,
      receiver: true,
    },
  });
};
