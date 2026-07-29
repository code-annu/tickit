import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";

export default abstract class SessionFactory {
  static async createSession(
    userId: string,
    data: Prisma.SessionCreateWithoutUserInput,
  ): Promise<any> {
    return prisma.session.create({
      data: {
        userId: userId,
        ...data,
      },
    });
  }

  static async findByTokenHash(tokenHash: string): Promise<any> {
    return prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
    });
  }

  static async findById(id: string): Promise<any> {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  static async findManyByUserId(userId: string): Promise<any[]> {
    return prisma.session.findMany({
      where: { userId },
    });
  }

  static async delete(id: string): Promise<any> {
    return prisma.session.delete({
      where: { id },
    });
  }

  static async update(
    id: string,
    data: Prisma.SessionUpdateInput,
  ): Promise<any> {
    return prisma.session.update({
      where: { id },
      data,
    });
  }
}
