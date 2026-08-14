import {
  User as PrismaUser,
  Session as PrismaSession,
} from "@/generated/prisma/client";
import { injectable } from "inversify";
import { User } from "../entity/user.entity";
import { UserSession } from "../entity/session.entity";

type SessionWithUser = PrismaSession & { user: PrismaUser };

@injectable()
export default class AuthMapper {
  toUserEntity(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      dob: user.dob ? user.dob.toLocaleDateString() : null,
      gender: user.gender,
      city: user.city,
      isEmailVerified: user.isEmailVerified,
      isBanned: user.isBanned,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toSessionEntity(session: SessionWithUser): UserSession {
    return {
      id: session.id,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      user: this.toUserEntity(session.user),
    };
  }
}
