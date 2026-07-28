import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { injectable } from "inversify";
import { Session } from "../entity/session.entity";

@injectable()
export default class SessionRepository {
  constructor(private readonly db = prisma) {}

  async create(
    userId: string,
    data: Prisma.SessionCreateWithoutUserInput,
  ): Promise<Session> {
    return this.db.session.create({
      data: { ...data, userId },
      include: { user: true },
    });
  }

  async findById(id: string): Promise<Session | null> {
    return this.db.session.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByTokenHash(refreshTokenHash: string): Promise<Session | null> {
    return this.db.session.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });
  }

  async findByUserId(userId: string): Promise<Session | null> {
    return this.db.session.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async update(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
    return this.db.session.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async revoke(id: string) {
    await this.db.session.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeByUserId(userId: string) {
    await this.db.session.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  async delete(id: string) {
    await this.db.session.delete({
      where: { id },
    });
  }
}
