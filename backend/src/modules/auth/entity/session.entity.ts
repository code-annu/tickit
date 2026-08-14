import { User } from "./user.entity";

export interface UserSession {
  readonly id: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
  readonly deviceName: string | null;
  readonly deviceType: string | null;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: User;

  refreshToken?: string | null;
  accessToken?: string | null;
}
