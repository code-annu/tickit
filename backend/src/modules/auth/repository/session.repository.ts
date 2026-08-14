import { inject, injectable } from "inversify";
import { UserSession } from "../entity/session.entity";
import { prisma } from "@/core/prisma/prisma.client";
import TYPES from "@/core/di/inversify.types";
import AuthMapper from "../mapper/auth.mapper";
import { Prisma } from "@/generated/prisma/client";

@injectable()
export default class SessionRepository {
  private readonly db = prisma;
  constructor(@inject(TYPES.AuthMapper) private readonly mapper: AuthMapper) {}

  async create(
    userId: string,
    data: Prisma.SessionCreateWithoutUserInput,
  ): Promise<UserSession> {
    const session = await this.db.session.create({
      data: { ...data, userId },
      include: { user: true },
    });

    return this.mapper.toSessionEntity(session);
  }

  async findById(id: string): Promise<UserSession | null> {
    const session = await this.db.session.findUnique({
      where: { id },
      include: { user: true },
    });
    return session ? this.mapper.toSessionEntity(session) : null;
  }

  async findByTokenHash(refreshTokenHash: string): Promise<UserSession | null> {
    const session = await this.db.session.findUnique({
      where: { tokenHash: refreshTokenHash },
      include: { user: true },
    });
    return session ? this.mapper.toSessionEntity(session) : null;
  }

  async findByUserId(userId: string): Promise<UserSession | null> {
    const session = await this.db.session.findUnique({
      where: { userId },
      include: { user: true },
    });
    return session ? this.mapper.toSessionEntity(session) : null;
  }

  async rotateToken(
    id: string,
    data: Prisma.SessionUpdateInput,
  ): Promise<UserSession> {
    const session = await this.db.session.update({
      where: { id },
      data,
      include: { user: true },
    });
    return this.mapper.toSessionEntity(session);
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
