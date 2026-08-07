import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";
import { buildProfileResponse } from "./profile.response";
import TYPES from "@/core/di/inversify.types";
import catchAsync from "@/core/error/async.catch";
import { ProfileCreateDto } from "./dto/profile-create.dto";
import { ProfileUpdateDto } from "./dto/profile-update.dto";
import ProfileService from "./profile.service";

@injectable()
export default class ProfileController {
  constructor(
    @inject(TYPES.ProfileService)
    private readonly profileService: ProfileService,
  ) {}

  postProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const input: ProfileCreateDto = {
        ...req.body,
        userId: req.auth!.sub,
      };
      const profile = await this.profileService.createProfile(input);

      return res
        .status(201)
        .json(buildProfileResponse(profile, "Profile created successfully"));
    },
  );

  getProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const userId = req.auth!.sub;
      const profile = await this.profileService.getProfile(userId);

      return res
        .status(200)
        .json(buildProfileResponse(profile, "Profile fetched successfully"));
    },
  );

  patchProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const input: ProfileUpdateDto = {
        ...req.body,
        id: req.auth!.sub,
      };
      const profile = await this.profileService.updateProfile(input);

      return res
        .status(200)
        .json(buildProfileResponse(profile, "Profile updated successfully"));
    },
  );

  deleteProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      await this.profileService.deleteProfile(req.auth!.sub);

      return res.status(204).send();
    },
  );
}
