import { inject, injectable } from "inversify";
import { User } from "../entity/user.entity";
import { prisma } from "@/core/prisma/prisma.client";
import { Prisma } from "@/generated/prisma/client";
import TYPES from "@/core/di/inversify.types";
import AuthMapper from "../mapper/auth.mapper";

@injectable()
export default class UserRepository {
  private readonly db = prisma;
  constructor(@inject(TYPES.AuthMapper) private readonly mapper: AuthMapper) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.db.user.create({ data });
    return this.mapper.toUserEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { id } });
    return user ? this.mapper.toUserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { email } });
    return user ? this.mapper.toUserEntity(user) : null;
  }

  async update(id: string, updates: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.db.user.update({ where: { id }, data: updates });
    return this.mapper.toUserEntity(user);
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.mapper.toUserEntity(user);
  }

  async permanentDelete(id: string) {
    await this.db.user.delete({ where: { id } });
  }
}
