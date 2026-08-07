import { User } from "@/shared/user/entity/user.entity";
import AuthService from "./auth.service";
import { Session } from "./entity/session.entity";
import { addDays, subHours } from "date-fns";
import ConflictError from "@/core/error/types/ConflictError";
import UserErrorCode from "@/shared/user/UserErrorCode";
import UnauthorizedError from "@/core/error/types/UnAuthorizedError";
import AuthErrorCode from "./AuthErrorCode";

// ─── Mock Factories ──────────────────────────────────────────────────────────

const sessionRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByTokenHash: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  revoke: vi.fn(),
  revokeByUserId: vi.fn(),
};

const userService = {
  createUser: vi.fn(),
  getByEmail: vi.fn(),
  verifyPassword: vi.fn(),
};

const jwtUtil = {
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  getRefreshTokenExpiry: vi.fn(),
  hashToken: vi.fn(),
  verifyAccessToken: vi.fn(),
};

const authService = new AuthService(
  sessionRepo as any,
  userService as any,
  jwtUtil as any,
);

// ─── Shared Fixtures ─────────────────────────────────────────────────────────

const client = {
  deviceName: "Chrome",
  deviceType: "desktop",
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0",
};

const user: User = {
  id: "user-1",
  email: "peter@gmail.com",
  passwordHash: "hashed_password",
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const session: Session = {
  id: "session-1",
  refreshTokenHash: "hashed_refresh_token",
  deviceName: client.deviceName,
  deviceType: client.deviceType,
  ipAddress: client.ipAddress,
  userAgent: client.userAgent,
  expiresAt: addDays(new Date(), 30),
  revokedAt: null,
  lastUsedAt: new Date(),
  user: user,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Helper: set up JWT + session mocks for createSession flow ───────────────

function setupCreateSessionMocks() {
  jwtUtil.generateRefreshToken.mockReturnValue("raw_refresh_token");
  jwtUtil.hashToken.mockReturnValue("hashed_refresh_token");
  jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 30));
  jwtUtil.generateAccessToken.mockReturnValue("access_token");
  sessionRepo.create.mockResolvedValue({ ...session });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════════════════════════════════════════

describe("AuthService — signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = { email: "peter@gmail.com", password: "Peter@1234", client };

  it("should create a user and return a session with tokens", async () => {
    userService.createUser.mockResolvedValue(user);
    setupCreateSessionMocks();

    const result = await authService.signup(input);

    expect(userService.createUser).toHaveBeenCalledWith(input.email, input.password);
    expect(sessionRepo.create).toHaveBeenCalledWith(user.id, {
      refreshTokenHash: "hashed_refresh_token",
      expiresAt: expect.any(Date),
      deviceName: client.deviceName,
      deviceType: client.deviceType,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent,
    });
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("raw_refresh_token");
    expect(result.user).toEqual(user);
  });

  it("should propagate ConflictError when email already exists", async () => {
    userService.createUser.mockRejectedValue(
      new ConflictError("Email already exists", UserErrorCode.EMAIL_ALREADY_EXISTS),
    );

    await expect(authService.signup(input)).rejects.toThrow(ConflictError);
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
  });

  it("should propagate unexpected errors from userService", async () => {
    userService.createUser.mockRejectedValue(new Error("DB connection lost"));

    await expect(authService.signup(input)).rejects.toThrow("DB connection lost");
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════

describe("AuthService — login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = { email: "peter@gmail.com", password: "Peter@1234", client };

  it("should login successfully when no existing session", async () => {
    userService.getByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(true);
    sessionRepo.findByUserId.mockResolvedValue(null);
    setupCreateSessionMocks();

    const result = await authService.login(input);

    expect(userService.getByEmail).toHaveBeenCalledWith(input.email);
    expect(userService.verifyPassword).toHaveBeenCalledWith(input.password, user.passwordHash);
    expect(sessionRepo.findByUserId).toHaveBeenCalledWith(user.id);
    expect(sessionRepo.delete).not.toHaveBeenCalled();
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("raw_refresh_token");
  });

  it("should delete existing session and create a new one", async () => {
    userService.getByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(true);
    sessionRepo.findByUserId.mockResolvedValue(session);
    setupCreateSessionMocks();

    const result = await authService.login(input);

    expect(sessionRepo.delete).toHaveBeenCalledWith(session.id);
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("raw_refresh_token");
  });

  it("should throw UnauthorizedError when user is not found", async () => {
    userService.getByEmail.mockResolvedValue(null);

    const error = await authService.login(input).catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedError when password is incorrect", async () => {
    userService.getByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(false);

    const error = await authService.login(input).catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedError when user is banned", async () => {
    userService.getByEmail.mockResolvedValue({ ...user, isBanned: true });
    userService.verifyPassword.mockResolvedValue(true);

    const error = await authService.login(input).catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedError when user is soft-deleted", async () => {
    userService.getByEmail.mockResolvedValue({ ...user, deletedAt: new Date() });
    userService.verifyPassword.mockResolvedValue(true);

    const error = await authService.login(input).catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REFRESH SESSION
// ═══════════════════════════════════════════════════════════════════════════════

describe("AuthService — refreshSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const refreshInput = { token: "raw_refresh_token", client };

  it("should rotate tokens and return updated session", async () => {
    jwtUtil.hashToken.mockReturnValue("hashed_refresh_token");
    sessionRepo.findByTokenHash.mockResolvedValue({ ...session });
    jwtUtil.generateRefreshToken.mockReturnValue("new_raw_refresh_token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 30));
    sessionRepo.update.mockResolvedValue({ ...session });
    jwtUtil.generateAccessToken.mockReturnValue("new_access_token");

    const result = await authService.refreshSession(refreshInput);

    expect(jwtUtil.hashToken).toHaveBeenCalledWith("raw_refresh_token");
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith("hashed_refresh_token");
    expect(jwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(sessionRepo.update).toHaveBeenCalledWith(session.id, {
      refreshTokenHash: expect.any(String),
      expiresAt: expect.any(Date),
    });
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(result.accessToken).toBe("new_access_token");
    expect(result.refreshToken).toBe("new_raw_refresh_token");
  });

  it("should throw MISSING_REFRESH_TOKEN when token is missing", async () => {
    const error = await authService
      .refreshSession({ token: undefined as any, client })
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
    expect(sessionRepo.findByTokenHash).not.toHaveBeenCalled();
  });

  it("should throw MISSING_REFRESH_TOKEN when token is null", async () => {
    const error = await authService
      .refreshSession({ token: null, client })
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
  });

  it("should throw INVALID_REFRESH_TOKEN when session not found", async () => {
    jwtUtil.hashToken.mockReturnValue("hashed_unknown");
    sessionRepo.findByTokenHash.mockResolvedValue(null);

    const error = await authService
      .refreshSession(refreshInput)
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
    expect(sessionRepo.update).not.toHaveBeenCalled();
  });

  it("should throw EXPIRED_REFRESH_TOKEN when token is expired", async () => {
    jwtUtil.hashToken.mockReturnValue("hashed_refresh_token");
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      expiresAt: subHours(new Date(), 1),
    });

    const error = await authService
      .refreshSession(refreshInput)
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.EXPIRED_REFRESH_TOKEN);
    expect(sessionRepo.update).not.toHaveBeenCalled();
  });

  it("should throw REVOKED_REFRESH_TOKEN when session is revoked", async () => {
    jwtUtil.hashToken.mockReturnValue("hashed_refresh_token");
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      revokedAt: new Date(),
    });

    const error = await authService
      .refreshSession(refreshInput)
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.REVOKED_REFRESH_TOKEN);
    expect(sessionRepo.update).not.toHaveBeenCalled();
  });

  it("should throw INVALID_CREDENTIALS when user is banned", async () => {
    jwtUtil.hashToken.mockReturnValue("hashed_refresh_token");
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: { ...user, isBanned: true },
    });

    const error = await authService
      .refreshSession(refreshInput)
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(sessionRepo.update).not.toHaveBeenCalled();
  });

  it("should throw INVALID_CREDENTIALS when user is soft-deleted", async () => {
    jwtUtil.hashToken.mockReturnValue("hashed_refresh_token");
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: { ...user, deletedAt: new Date() },
    });

    const error = await authService
      .refreshSession(refreshInput)
      .catch((e) => e);

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(sessionRepo.update).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════════════════════

describe("AuthService — logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should revoke the session by id", async () => {
    sessionRepo.revoke.mockResolvedValue(undefined);

    await authService.logout("session-1");

    expect(sessionRepo.revoke).toHaveBeenCalledWith("session-1");
    expect(sessionRepo.revoke).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGOUT ALL
// ═══════════════════════════════════════════════════════════════════════════════

describe("AuthService — logoutAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should revoke all sessions for the user", async () => {
    sessionRepo.revokeByUserId.mockResolvedValue(undefined);

    await authService.logoutAll("user-1");

    expect(sessionRepo.revokeByUserId).toHaveBeenCalledWith("user-1");
    expect(sessionRepo.revokeByUserId).toHaveBeenCalledTimes(1);
  });
});
