import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import UserRepository from "./repository/user.repository";
import SessionRepository from "./repository/session.repository";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dt";
import { User } from "./entity/user.entity";
import { ClientInfoType } from "@/shared/util/client-info.util";
import { UserSession } from "./entity/session.entity";
import JWTUtil from "@/shared/util/jwt.util";
import {
  EmailAlreadyExists,
  ExpiredRefreshTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  MissingRefreshTokenError,
  RevokedRefreshTokenError,
} from "./error/errors";
import bcrypt from "bcrypt";
import { RefreshSessionDto } from "./dto/refresh-session.dto";

@injectable()
export default class AuthService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
    @inject(TYPES.SessionRepository)
    private readonly sessionRepo: SessionRepository,
    @inject(TYPES.JWTUtil) private readonly jwtUtil: JWTUtil,
  ) {}

  async signup(input: SignupDto) {
    const { client, ...rest } = input;

    const existingUser = await this.userRepo.findByEmail(rest.email);
    if (existingUser) {
      throw new EmailAlreadyExists("Email already exists");
    }

    const passwordHash = await bcrypt.hash(rest.password, 10);
    const user = await this.userRepo.create({
      email: rest.email,
      passwordHash,
      firstName: rest.firstName,
      lastName: rest.lastName ?? null,
      gender: rest.gender,
      city: rest.city,
      avatarUrl: rest.avatarUrl ?? null,
      dob: rest.dob ?? null,
    });

    return this.createSession(user, client);
  }

  async login(input: LoginDto) {
    const { client, email, password } = input;
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError("Invalid auth credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid || user.isBanned || user.deletedAt) {
      throw new InvalidCredentialsError("Invalid auth credentials");
    }

    return this.createSession(user, client);
  }

  async refreshSession(input: RefreshSessionDto) {
    const { client, token } = input;
    if (!token) {
      throw new MissingRefreshTokenError("Refresh token is missing");
    }

    const tokenHash = this.jwtUtil.hashToken(token);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session) {
      throw new InvalidRefreshTokenError("Refresh token is invalid");
    }
    if (session.expiresAt < new Date()) {
      throw new ExpiredRefreshTokenError("Refresh token is expired");
    }
    if (session.revokedAt) {
      throw new RevokedRefreshTokenError("Refresh token is revoked");
    }
    if (session.user.deletedAt || session.user.isBanned) {
      throw new InvalidCredentialsError("Invalid user credentials");
    }

    const refreshToken = this.jwtUtil.generateRefreshToken();
    const updatedSession = await this.sessionRepo.update(session.id, {
      tokenHash: this.jwtUtil.hashToken(refreshToken),
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

  // Private methods
  private async createSession(
    user: User,
    client: ClientInfoType,
  ): Promise<UserSession> {
    const refreshToken = this.jwtUtil.generateRefreshToken();
    const session = await this.sessionRepo.create(user.id, {
      tokenHash: this.jwtUtil.hashToken(refreshToken),
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
