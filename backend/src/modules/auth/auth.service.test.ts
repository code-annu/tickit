import { User } from "@/shared/user/entity/user.entity";
import AuthService from "./auth.service";
import { Session } from "./entity/session.entity";
import { addDays, subHours } from "date-fns";
import ConflictError from "@/shared/error/types/ConflictError";
import UserErrorCode from "@/shared/user/UserErrorCode";
import UnauthorizedError from "@/shared/error/types/UnAuthorizedError";

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
};

const authService = new AuthService(
  sessionRepo as any,
  userService as any,
  jwtUtil as any,
);

const input = {
  email: "peter@gmail.com",
  password: "Peter@1234",
  client: {
    deviceName: "device1",
    deviceType: "device1",
    ipAddress: "[IP_ADDRESS]",
    userAgent: "userAgent1",
  },
};

const user: User = {
  id: "user-1",
  email: "peter@gmail.com",
  passwordHash: "password_hash",
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const session: Session = {
  id: "session-1",
  refreshTokenHash: "refresh_token_hash",
  deviceName: input.client.deviceName,
  deviceType: input.client.deviceType,
  ipAddress: input.client.ipAddress,
  userAgent: input.client.userAgent,
  expiresAt: addDays(new Date(), 30),
  revokedAt: null,
  lastUsedAt: new Date(),
  user: user,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    userService.createUser.mockResolvedValue(user);
    jwtUtil.generateRefreshToken.mockReturnValue("refresh_token");
    jwtUtil.hashToken.mockReturnValue("refresh_token_hash");
    jwtUtil.generateAccessToken.mockReturnValue("access_token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 30));
    sessionRepo.create.mockResolvedValue(session);
  });

  it("Should signup successfully", async () => {
    const result = await authService.signup(input);

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result).toHaveProperty("user");
  });

  it("Should throw conflict error", async () => {
    userService.createUser.mockRejectedValue(
      new ConflictError(
        "Email already exists",
        UserErrorCode.EMAIL_ALREADY_EXISTS,
      ),
    );

    await expect(authService.signup(input)).rejects.toThrow(ConflictError);
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });
});

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    jwtUtil.generateRefreshToken.mockReturnValue("refresh_token");
    jwtUtil.hashToken.mockReturnValue("refresh_token_hash");
    jwtUtil.generateAccessToken.mockReturnValue("access_token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 30));
    sessionRepo.create.mockResolvedValue(session);
  });

  it("Should login successfully when non existing session ", async () => {
    userService.getByEmail.mockResolvedValue(user);
    sessionRepo.findByUserId.mockResolvedValue(null);
    userService.verifyPassword.mockResolvedValue(true);
    const result = await authService.login(input);
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result).toHaveProperty("user");
    expect(sessionRepo.delete).not.toHaveBeenCalled();
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
  });

  it("Should login successfully for existing session", async () => {
    userService.getByEmail.mockResolvedValue(user);
    sessionRepo.findByUserId.mockResolvedValue(session);
    userService.verifyPassword.mockResolvedValue(true);
    const result = await authService.login(input);
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result).toHaveProperty("user");
    expect(sessionRepo.delete).toHaveBeenCalledTimes(1);
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
  });

  it("should throw error when user is not found", async () => {
    userService.getByEmail.mockResolvedValue(null);
    await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.delete).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("should throw error when password is incorrect", async () => {
    userService.getByEmail.mockResolvedValue(user);
    sessionRepo.findByUserId.mockResolvedValue(null);
    userService.verifyPassword.mockResolvedValue(false);
    await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.delete).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("Should throw error when user is banned", async () => {
    userService.getByEmail.mockResolvedValue({ ...user, isBanned: true });
    sessionRepo.findByUserId.mockResolvedValue(null);
    userService.verifyPassword.mockResolvedValue(true);
    await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.delete).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("Should throw error when user is deleted", async () => {
    userService.getByEmail.mockResolvedValue({
      ...user,
      deletedAt: new Date(),
    });
    sessionRepo.findByUserId.mockResolvedValue(null);
    userService.verifyPassword.mockResolvedValue(true);
    await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByUserId).not.toHaveBeenCalled();
    expect(sessionRepo.delete).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });
});

describe("Refresh session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    jwtUtil.hashToken.mockReturnValue("refresh_token_hash");
    sessionRepo.findByTokenHash.mockResolvedValue(session);
    jwtUtil.generateRefreshToken.mockReturnValue("refresh_token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 30));
    sessionRepo.update.mockResolvedValue({
      ...session,
      refreshTokenHash: "refresh_token_hash",
      expiresAt: addDays(new Date(), 30),
    });
    jwtUtil.generateAccessToken.mockReturnValue("access_token");
  });

  it("Should refresh session successfully", async () => {
    const result = await authService.refreshSession({
      token: "refresh_token",
      client: input.client,
    });
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result).toHaveProperty("user");
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledTimes(1);
    expect(sessionRepo.update).toHaveBeenCalledTimes(1);
    expect(jwtUtil.hashToken).toHaveBeenCalledTimes(2);
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.generateRefreshToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.getRefreshTokenExpiry).toHaveBeenCalledTimes(1);
  });

  it("Should throw error when refresh token is invalid", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue(null);
    await expect(
      authService.refreshSession({
        token: "invalid_token",
        client: input.client,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledTimes(1);
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when refresh token is expired", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      expiresAt: subHours(new Date(), 24),
    });
    await expect(
      authService.refreshSession({
        token: "refresh_token_hash",
        client: input.client,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledTimes(1);
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when refresh token is revoked", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      revokedAt: new Date(),
    });
    await expect(
      authService.refreshSession({
        token: "refresh_token_hash",
        client: input.client,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledTimes(1);
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is banned", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: { ...user, isBanned: true },
    });
    await expect(
      authService.refreshSession({
        token: "refresh_token_hash",
        client: input.client,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledTimes(1);
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is deleted", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: { ...user, deletedAt: new Date() },
    });
    await expect(
      authService.refreshSession({
        token: "refresh_token_hash",
        client: input.client,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledTimes(1);
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledTimes(1);
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });
});
