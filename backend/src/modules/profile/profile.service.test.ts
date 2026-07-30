import { describe } from "vitest";
import ProfileService from "./profile.service";
import { User } from "@/shared/user/entity/user.entity";
import { Gender, Profile } from "./entity/profile.entity";
import NotFoundError from "@/shared/error/types/NotFoundError";
import ConflictError from "@/shared/error/types/ConflictError";

const profileRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const userService = {
  deleteUser: vi.fn(),
};

const profileService = new ProfileService(
  profileRepo as any,
  userService as any,
);

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

const profile: Profile = {
  id: "user-1",
  fullname: "Peter Parker",
  dob: new Date(),
  gender: Gender.MALE,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user,
};

describe("Get profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should return profile", async () => {
    profileRepo.findById.mockResolvedValue(profile);
    const result = await profileService.getProfile("user-1");

    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
  });

  it("Should throw error for profile not found", async () => {
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.getProfile("user-1")).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
  });
});

describe("Create profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should create profile", async () => {
    const input = {
      userId: "user-1",
      fullname: "Peter Parker",
      dob: new Date(),
      gender: Gender.MALE,
      avatarUrl: null,
    };
    profileRepo.findById.mockResolvedValue(null);
    profileRepo.create.mockResolvedValue(profile);
    const result = await profileService.createProfile(input);

    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.create).toHaveBeenCalled();
  });

  it("Should throw error for profile existence", async () => {
    const input = {
      userId: "user-1",
      fullname: "Peter Parker",
      dob: new Date(),
      gender: Gender.MALE,
      avatarUrl: null,
    };
    profileRepo.findById.mockResolvedValue(profile);
    await expect(profileService.createProfile(input)).rejects.toThrow(
      ConflictError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
  });
});

describe("Update profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should update profile", async () => {
    const input = {
      id: "user-1",
      fullname: "Peter Parker",
      dob: new Date(),
      gender: Gender.MALE,
      avatarUrl: null,
    };
    profileRepo.findById.mockResolvedValue(profile);
    profileRepo.update.mockResolvedValue(profile);
    const result = await profileService.updateProfile(input);

    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.update).toHaveBeenCalled();
  });

  it("Should throw error for profile not found", async () => {
    const input = {
      id: "user-1",
      fullname: "Peter Parker",
      dob: new Date(),
      gender: Gender.MALE,
      avatarUrl: null,
    };
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.updateProfile(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
  });
});

describe("Delete profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should delete profile", async () => {
    profileRepo.findById.mockResolvedValue(profile);
    userService.deleteUser.mockResolvedValue(undefined);
    await profileService.deleteProfile("user-1");

    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(userService.deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("Should throw error for profile not found", async () => {
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.deleteProfile("user-1")).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
  });
});
