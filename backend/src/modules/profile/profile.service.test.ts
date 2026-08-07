import ProfileService from "./profile.service";
import { User } from "@/shared/user/entity/user.entity";
import { Gender, Profile } from "./entity/profile.entity";
import NotFoundError from "@/core/error/types/NotFoundError";
import ConflictError from "@/core/error/types/ConflictError";
import ProfileErrorCode from "./ProfileErrorCode";

// ─── Mock Repositories & Services ──────────────────────────────────────────

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

// ─── Shared Fixtures ─────────────────────────────────────────────────────────

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
  dob: new Date("2000-01-01"),
  gender: Gender.MALE,
  avatarUrl: "https://example.com/avatar.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  user,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

describe("ProfileService — getProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return profile when profile exists for the user", async () => {
    profileRepo.findById.mockResolvedValue(profile);

    const result = await profileService.getProfile("user-1");

    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.findById).toHaveBeenCalledTimes(1);
  });

  it("should throw NotFoundError when profile is not found", async () => {
    profileRepo.findById.mockResolvedValue(null);

    const error = await profileService.getProfile("user-1").catch((e) => e);

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

describe("ProfileService — createProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createInput = {
    userId: "user-1",
    fullname: "Peter Parker",
    dob: new Date("2000-01-01"),
    gender: Gender.MALE,
    avatarUrl: "https://example.com/avatar.jpg",
  };

  it("should create and return a new profile when profile does not exist", async () => {
    profileRepo.findById.mockResolvedValue(null);
    profileRepo.create.mockResolvedValue(profile);

    const result = await profileService.createProfile(createInput);

    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.create).toHaveBeenCalledWith("user-1", {
      fullname: createInput.fullname,
      dob: createInput.dob,
      gender: createInput.gender,
      avatarUrl: createInput.avatarUrl,
    });
  });

  it("should throw ConflictError when profile already exists for the user", async () => {
    profileRepo.findById.mockResolvedValue(profile);

    const error = await profileService.createProfile(createInput).catch((e) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect(error.code).toBe(ProfileErrorCode.PROFILE_ALREADY_EXISTS);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.create).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

describe("ProfileService — updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updateInput = {
    id: "user-1",
    fullname: "Peter Parker Updated",
    gender: Gender.FEMALE,
  };

  it("should update and return profile when profile exists", async () => {
    const updatedProfile = { ...profile, fullname: updateInput.fullname, gender: updateInput.gender };
    profileRepo.findById.mockResolvedValue(profile);
    profileRepo.update.mockResolvedValue(updatedProfile);

    const result = await profileService.updateProfile(updateInput);

    expect(result).toEqual(updatedProfile);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.update).toHaveBeenCalledWith("user-1", {
      fullname: updateInput.fullname,
      gender: updateInput.gender,
    });
  });

  it("should throw NotFoundError when profile to update is not found", async () => {
    profileRepo.findById.mockResolvedValue(null);

    const error = await profileService.updateProfile(updateInput).catch((e) => e);

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(profileRepo.update).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

describe("ProfileService — deleteProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should soft delete user when profile exists", async () => {
    profileRepo.findById.mockResolvedValue(profile);
    userService.deleteUser.mockResolvedValue(user);

    await profileService.deleteProfile("user-1");

    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(userService.deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("should throw NotFoundError when profile to delete is not found", async () => {
    profileRepo.findById.mockResolvedValue(null);

    const error = await profileService.deleteProfile("user-1").catch((e) => e);

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
    expect(profileRepo.findById).toHaveBeenCalledWith("user-1");
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });
});
