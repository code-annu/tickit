import { User } from "@/shared/user/entity/user.entity";

export interface Session {
  readonly id: string;
  readonly refreshTokenHash: string;
  accessToken?: string | null;
  refreshToken?: string | null;

  readonly deviceName: string | null;
  readonly deviceType: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;

  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
  readonly lastUsedAt: Date;
  readonly user: User;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
