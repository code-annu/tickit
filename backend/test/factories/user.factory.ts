import bcrypt from "bcrypt";
import { prisma } from "@/core/prisma/prisma.client";
import { Prisma } from "@/generated/prisma/client";

export default abstract class UserFactory {
  static async createUser(email: string, password: string): Promise<any> {
    return prisma.user.create({
      data: {
        email: email,
        passwordHash: await bcrypt.hash(password, 10),
        firstName: "John",
        lastName: "Doe",
        gender: "MALE",
        city: "New York",
      },
    });
  }

  static async findById(id: string) {
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
