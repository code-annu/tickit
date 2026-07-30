import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import ProfileRepository from "./repository/profile.repository";
import { Profile } from "./entity/profile.entity";
import { ProfileCreateDto } from "./dto/profile-create.dto";
import { ProfileUpdateDto } from "./dto/profile-update.dto";
import NotFoundError from "@/shared/error/types/NotFoundError";
import ConflictError from "@/shared/error/types/ConflictError";
import ProfileErrorCode from "./ProfileErrorCode";
import UserService from "@/shared/user/user.service";

@injectable()
export default class ProfileService {
  constructor(
    @inject(TYPES.ProfileRepository)
    private readonly profileRepo: ProfileRepository,
    @inject(TYPES.UserService) private readonly userService: UserService,
  ) {}

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findById(userId);
    if (!profile) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }
    return profile;
  }

  async createProfile(input: ProfileCreateDto): Promise<Profile> {
    const { userId, ...data } = input;

    const existingProfile = await this.profileRepo.findById(userId);
    if (existingProfile) {
      throw new ConflictError(
        "Profile already exists",
        ProfileErrorCode.PROFILE_ALREADY_EXISTS,
      );
    }

    return this.profileRepo.create(userId, data);
  }

  async updateProfile(input: ProfileUpdateDto): Promise<Profile> {
    const { id, ...updates } = input;

    const existingProfile = await this.profileRepo.findById(id);
    if (!existingProfile) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }

    return this.profileRepo.update(id, updates);
  }

  async deleteProfile(profileId: string): Promise<void> {
    const existingProfile = await this.profileRepo.findById(profileId);
    if (!existingProfile) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }

    await this.userService.deleteUser(profileId);
  }
}
