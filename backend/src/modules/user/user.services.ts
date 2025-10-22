import prisma from "../../prisma.ts";

export const userLogin = async (email: string) => {
  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return await prisma.user.create({
      data: {
        email,
      },
    });
  }

  return user;
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const getConversationsForUser = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    select: {
      id: true,
      user1: { select: { id: true, email: true } },
      user2: { select: { id: true, email: true } },
    },
  });

  return conversations;
};
