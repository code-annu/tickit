import bcrypt from "bcrypt";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/core/prisma/prisma.client";

export default abstract class UserFactory {
  static async createUser(email: string, password: string): Promise<any> {
    return prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
  }

  static async findById(id: string): Promise<any> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findAll(): Promise<any[]> {
    return prisma.user.findMany();
  }

  static async update(id: string, data: Prisma.UserUpdateInput): Promise<any> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
