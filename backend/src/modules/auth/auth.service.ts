import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import SessionRepository from "./repository/session.repository";
import UserService from "@/shared/user/user.service";
import { Session } from "./entity/session.entity";
import { SignupDto } from "./dto/signup.dto";
import { User } from "@/shared/user/entity/user.entity";
import { ClientInfoType } from "@/shared/util/client-info.util";
import JWTUtil from "@/shared/util/jwt.util";
import UnauthorizedError from "@/shared/error/types/UnAuthorizedError";
import AuthErrorCode from "./AuthErrorCode";
import { LoginDto } from "./dto/login.dto";
import { RefreshSessionDto } from "./dto/refresh-session.dto";

@injectable()
export default class AuthService {
  constructor(
    @inject(TYPES.SessionRepository)
    private readonly sessionRepo: SessionRepository,
    @inject(TYPES.UserService) private readonly userService: UserService,
    @inject(TYPES.JWTUtil) private readonly jwtUtil: JWTUtil,
  ) {}

  async signup(input: SignupDto): Promise<Session> {
    const { email, password, client } = input;
    const user = await this.userService.createUser(email, password);

    return this.createSession(user, client);
  }

  async login(input: LoginDto): Promise<Session> {
    const { email, password } = input;

    const user = await this.userService.getByEmail(email);
    if (
      !user ||
      !(await this.userService.verifyPassword(password, user.passwordHash)) ||
      user.deletedAt ||
      user.isBanned
    ) {
      throw new UnauthorizedError(
        "Invalid email or password",
        AuthErrorCode.INVALID_CREDENTIALS,
      );
    }
    let newSession: Session;

    const existingSession = await this.sessionRepo.findByUserId(user.id);
    if (existingSession) {
      await this.sessionRepo.delete(existingSession.id);
    }
    newSession = await this.createSession(user, input.client);

    return newSession;
  }

  async refreshSession(input: RefreshSessionDto): Promise<Session> {
    const token = input.token;
    if (!token) {
      throw new UnauthorizedError(
        "Refresh token is missing",
        AuthErrorCode.MISSING_REFRESH_TOKEN,
      );
    }

    const tokenHash = this.jwtUtil.hashToken(token);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session) {
      throw new UnauthorizedError(
        "Refresh token is invalid",
        AuthErrorCode.INVALID_REFRESH_TOKEN,
      );
    }
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError(
        "Refresh token is expired",
        AuthErrorCode.EXPIRED_REFRESH_TOKEN,
      );
    }
    if (session.revokedAt) {
      throw new UnauthorizedError(
        "Refresh token is revoked",
        AuthErrorCode.REVOKED_REFRESH_TOKEN,
      );
    }
    if (session.user.deletedAt || session.user.isBanned) {
      throw new UnauthorizedError(
        "Invalid user credentials",
        AuthErrorCode.INVALID_CREDENTIALS,
      );
    }

    const refreshToken = this.jwtUtil.generateRefreshToken();
    const updatedSession = await this.sessionRepo.update(session.id, {
      refreshTokenHash: this.jwtUtil.hashToken(refreshToken),
      expiresAt: this.jwtUtil.getRefreshTokenExpiry(),
    });

    const accessToken = this.jwtUtil.generateAccessToken({
      sub: updatedSession.user.id,
      sid: updatedSession.id,
    });
    updatedSession.refreshToken = refreshToken;
    updatedSession.accessToken = accessToken;

    return updatedSession;
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepo.revoke(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionRepo.revokeByUserId(userId);
  }

  // Private methods
  private async createSession(
    user: User,
    client: ClientInfoType,
  ): Promise<Session> {
    const refreshToken = this.jwtUtil.generateRefreshToken();
    const session = await this.sessionRepo.create(user.id, {
      refreshTokenHash: this.jwtUtil.hashToken(refreshToken),
      expiresAt: this.jwtUtil.getRefreshTokenExpiry(),
      deviceName: client.deviceName,
      deviceType: client.deviceType,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent,
    });

    const accessToken = this.jwtUtil.generateAccessToken({
      sub: user.id,
      sid: session.id,
    });

    session.accessToken = accessToken;
    session.refreshToken = refreshToken;

    return session;
  }
}
