import ConflictError from "../error/types/ConflictError";
import { User } from "./entity/user.entity";
import UserService from "./user.service";
import bcrypt from "bcrypt";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const input = {
  email: "peter@gmail.com",
  password: "Peter@1234",
};

const userRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
};

const userService = new UserService(userRepo as any);

describe("Create user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new user", async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("passwordHash" as never);
    userRepo.create.mockResolvedValue({
      id: "user-1",
      passwordHash: "passwordHash",
      email: "peter@gmail.com",
      isEmailVerified: false,
      isBanned: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);

    const user = await userService.createUser(input.email, input.password);
    expect(user.id).toBe("user-1");
    expect(userRepo.create).toHaveBeenCalledTimes(1);
  });

  it("Should throw for duplicate email error", async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: "user-1",
      username: "peter",
      passwordHash: "passwordHash",
      email: "peter@gmail.com",
      isEmailVerified: false,
      isBanned: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);
    vi.mocked(bcrypt.hash).mockResolvedValue("passwordHash" as never);

    await expect(
      userService.createUser(input.email, input.password),
    ).rejects.toThrow(ConflictError);
  });
});
