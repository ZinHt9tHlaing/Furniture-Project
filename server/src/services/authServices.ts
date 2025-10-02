import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const getUserByPhone = async (phone: string) => {
  return await prisma.user.findUnique({ where: { phone } });
};
