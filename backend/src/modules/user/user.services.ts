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
