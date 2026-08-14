import { vi, type Mock } from "vitest";
import AuthService from "./auth.service";
import type UserRepository from "./repository/user.repository";
import type SessionRepository from "./repository/session.repository";
import type JWTUtil from "@/shared/util/jwt.util";
import type { User } from "./entity/user.entity";
import type { UserSession } from "./entity/session.entity";
import type { ClientInfoType } from "@/shared/util/client-info.util";
import {
  EmailAlreadyExists,
  ExpiredRefreshTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  MissingRefreshTokenError,
  RevokedRefreshTokenError,
} from "./error/errors";

// ---------------------------------------------------------------------------
// bcrypt mock – keeps tests fast & deterministic
// ---------------------------------------------------------------------------
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

import bcrypt from "bcrypt";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const mockClient: ClientInfoType = {
  deviceName: "Chrome",
  deviceType: "desktop",
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0",
};

const now = new Date();

const mockUser: User = {
  id: "user-1",
  email: "john@example.com",
  passwordHash: "hashed-password",
  firstName: "John",
  lastName: "Doe",
  avatarUrl: null,
  dob: null,
  gender: "MALE",
  city: "Mumbai",
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
};

const mockSession: UserSession = {
  id: "session-1",
  tokenHash: "hashed-refresh-token",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days out
  revokedAt: null,
  deviceName: "Chrome",
  deviceType: "desktop",
  userAgent: "Mozilla/5.0",
  ipAddress: "127.0.0.1",
  createdAt: now,
  updatedAt: now,
  user: mockUser,
};

// ---------------------------------------------------------------------------
// Factory for mocked dependencies
// ---------------------------------------------------------------------------
function createMocks() {
  const userRepo: Record<string, Mock> = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  };

  const sessionRepo: Record<string, Mock> = {
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    update: vi.fn(),
    revoke: vi.fn(),
  };

  const jwtUtil: Record<string, Mock> = {
    generateRefreshToken: vi.fn().mockReturnValue("raw-refresh-token"),
    hashToken: vi.fn().mockReturnValue("hashed-refresh-token"),
    getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date("2030-01-01")),
    generateAccessToken: vi.fn().mockReturnValue("access-token-jwt"),
  };

  const authService = new (AuthService as any)(userRepo, sessionRepo, jwtUtil);

  return {
    authService: authService as AuthService,
    userRepo: userRepo as unknown as UserRepository,
    sessionRepo: sessionRepo as unknown as SessionRepository,
    jwtUtil: jwtUtil as unknown as JWTUtil,
  };
}

// ===========================================================================
// SIGNUP
// ===========================================================================
describe("Signup", () => {
  it("should create a new user and return a session with tokens", async () => {
    const { authService, userRepo, sessionRepo, jwtUtil } = createMocks();
    (userRepo.findByEmail as Mock).mockResolvedValue(null);
    (userRepo.create as Mock).mockResolvedValue(mockUser);
    (sessionRepo.create as Mock).mockResolvedValue({ ...mockSession });

    const result = await authService.signup({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      city: "Mumbai",
      gender: "MALE",
      client: mockClient,
    });

    // Repository calls
    expect(userRepo.findByEmail).toHaveBeenCalledWith("john@example.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "john@example.com",
        passwordHash: "hashed-password",
        firstName: "John",
        lastName: "Doe",
        gender: "MALE",
        city: "Mumbai",
      }),
    );

    // Session creation
    expect(sessionRepo.create).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        tokenHash: "hashed-refresh-token",
        deviceName: mockClient.deviceName,
        deviceType: mockClient.deviceType,
        ipAddress: mockClient.ipAddress,
        userAgent: mockClient.userAgent,
      }),
    );

    // Token generation
    expect(jwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: mockUser.id,
      sid: mockSession.id,
    });

    // Returned session has both tokens
    expect(result.accessToken).toBe("access-token-jwt");
    expect(result.refreshToken).toBe("raw-refresh-token");
  });

  it("should throw EmailAlreadyExists when email is taken", async () => {
    const { authService, userRepo } = createMocks();
    (userRepo.findByEmail as Mock).mockResolvedValue(mockUser);

    await expect(
      authService.signup({
        firstName: "John",
        email: "john@example.com",
        password: "password123",
        city: "Mumbai",
        gender: "MALE",
        client: mockClient,
      }),
    ).rejects.toThrow(EmailAlreadyExists);
  });

  it("should set nullable fields to null when not provided", async () => {
    const { authService, userRepo, sessionRepo } = createMocks();
    (userRepo.findByEmail as Mock).mockResolvedValue(null);
    (userRepo.create as Mock).mockResolvedValue(mockUser);
    (sessionRepo.create as Mock).mockResolvedValue({ ...mockSession });

    await authService.signup({
      firstName: "John",
      email: "john@example.com",
      password: "password123",
      city: "Mumbai",
      gender: "MALE",
      client: mockClient,
      // lastName, avatarUrl, dob intentionally omitted
    });

    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        lastName: null,
        avatarUrl: null,
        dob: null,
      }),
    );
  });
});

// ===========================================================================
// LOGIN
// ===========================================================================
describe("Login", () => {
  it("should login with valid credentials and return a session", async () => {
    const { authService, userRepo, sessionRepo, jwtUtil } = createMocks();
    (userRepo.findByEmail as Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as Mock).mockResolvedValue(true);
    (sessionRepo.create as Mock).mockResolvedValue({ ...mockSession });

    const result = await authService.login({
      email: "john@example.com",
      password: "password123",
      client: mockClient,
    });

    expect(userRepo.findByEmail).toHaveBeenCalledWith("john@example.com");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      mockUser.passwordHash,
    );
    expect(sessionRepo.create).toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).toHaveBeenCalled();
    expect(result.accessToken).toBe("access-token-jwt");
    expect(result.refreshToken).toBe("raw-refresh-token");
  });

  it("should throw InvalidCredentialsError when user is not found", async () => {
    const { authService, userRepo } = createMocks();
    (userRepo.findByEmail as Mock).mockResolvedValue(null);

    await expect(
      authService.login({
        email: "unknown@example.com",
        password: "password123",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should throw InvalidCredentialsError when password is wrong", async () => {
    const { authService, userRepo } = createMocks();
    (userRepo.findByEmail as Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as Mock).mockResolvedValue(false);

    await expect(
      authService.login({
        email: "john@example.com",
        password: "wrong-password",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should throw InvalidCredentialsError when user is banned", async () => {
    const { authService, userRepo } = createMocks();
    const bannedUser = { ...mockUser, isBanned: true };
    (userRepo.findByEmail as Mock).mockResolvedValue(bannedUser);
    (bcrypt.compare as Mock).mockResolvedValue(true);

    await expect(
      authService.login({
        email: "john@example.com",
        password: "password123",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should throw InvalidCredentialsError when user is soft-deleted", async () => {
    const { authService, userRepo } = createMocks();
    const deletedUser = { ...mockUser, deletedAt: new Date() };
    (userRepo.findByEmail as Mock).mockResolvedValue(deletedUser);
    (bcrypt.compare as Mock).mockResolvedValue(true);

    await expect(
      authService.login({
        email: "john@example.com",
        password: "password123",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});

// ===========================================================================
// REFRESH SESSION
// ===========================================================================
describe("Refresh Session", () => {
  it("should refresh the session and return new tokens", async () => {
    const { authService, sessionRepo, jwtUtil } = createMocks();
    const existingSession = { ...mockSession };
    (sessionRepo.findByTokenHash as Mock).mockResolvedValue(existingSession);
    (sessionRepo.update as Mock).mockResolvedValue({ ...existingSession });

    const result = await authService.refreshSession({
      token: "old-refresh-token",
      client: mockClient,
    });

    // Token hashing for lookup
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("old-refresh-token");

    // Session update with rotated token
    expect(sessionRepo.update).toHaveBeenCalledWith(
      mockSession.id,
      expect.objectContaining({
        tokenHash: "hashed-refresh-token",
      }),
    );

    // New access token
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: mockUser.id,
      sid: mockSession.id,
    });

    expect(result.accessToken).toBe("access-token-jwt");
    expect(result.refreshToken).toBe("raw-refresh-token");
  });

  it("should throw MissingRefreshTokenError when token is falsy", async () => {
    const { authService } = createMocks();

    await expect(
      authService.refreshSession({ client: mockClient }),
    ).rejects.toThrow(MissingRefreshTokenError);

    await expect(
      authService.refreshSession({ token: null, client: mockClient }),
    ).rejects.toThrow(MissingRefreshTokenError);

    await expect(
      authService.refreshSession({ token: "", client: mockClient }),
    ).rejects.toThrow(MissingRefreshTokenError);
  });

  it("should throw InvalidRefreshTokenError when session is not found", async () => {
    const { authService, sessionRepo } = createMocks();
    (sessionRepo.findByTokenHash as Mock).mockResolvedValue(null);

    await expect(
      authService.refreshSession({
        token: "nonexistent-token",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidRefreshTokenError);
  });

  it("should throw ExpiredRefreshTokenError when session is expired", async () => {
    const { authService, sessionRepo } = createMocks();
    const expiredSession = {
      ...mockSession,
      expiresAt: new Date("2000-01-01"), // well in the past
    };
    (sessionRepo.findByTokenHash as Mock).mockResolvedValue(expiredSession);

    await expect(
      authService.refreshSession({
        token: "expired-token",
        client: mockClient,
      }),
    ).rejects.toThrow(ExpiredRefreshTokenError);
  });

  it("should throw RevokedRefreshTokenError when session is revoked", async () => {
    const { authService, sessionRepo } = createMocks();
    const revokedSession = {
      ...mockSession,
      revokedAt: new Date(),
    };
    (sessionRepo.findByTokenHash as Mock).mockResolvedValue(revokedSession);

    await expect(
      authService.refreshSession({
        token: "revoked-token",
        client: mockClient,
      }),
    ).rejects.toThrow(RevokedRefreshTokenError);
  });

  it("should throw InvalidCredentialsError when user is soft-deleted", async () => {
    const { authService, sessionRepo } = createMocks();
    const sessionWithDeletedUser = {
      ...mockSession,
      user: { ...mockUser, deletedAt: new Date() },
    };
    (sessionRepo.findByTokenHash as Mock).mockResolvedValue(
      sessionWithDeletedUser,
    );

    await expect(
      authService.refreshSession({
        token: "some-token",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should throw InvalidCredentialsError when user is banned", async () => {
    const { authService, sessionRepo } = createMocks();
    const sessionWithBannedUser = {
      ...mockSession,
      user: { ...mockUser, isBanned: true },
    };
    (sessionRepo.findByTokenHash as Mock).mockResolvedValue(
      sessionWithBannedUser,
    );

    await expect(
      authService.refreshSession({
        token: "some-token",
        client: mockClient,
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});

// ===========================================================================
// LOGOUT
// ===========================================================================
describe("Logout", () => {
  it("should revoke the session by id", async () => {
    const { authService, sessionRepo } = createMocks();
    (sessionRepo.revoke as Mock).mockResolvedValue(undefined);

    await authService.logout("session-1");

    expect(sessionRepo.revoke).toHaveBeenCalledWith("session-1");
  });

  it("should propagate errors from sessionRepo.revoke", async () => {
    const { authService, sessionRepo } = createMocks();
    (sessionRepo.revoke as Mock).mockRejectedValue(new Error("DB error"));

    await expect(authService.logout("session-1")).rejects.toThrow("DB error");
  });
});
