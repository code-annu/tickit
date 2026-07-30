import { validateRequestBody } from "@/shared/middleware/validate-request-body.middleware";
import { Router } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/di/inversify.types";
import ProfileController from "./profile.controller";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import { profileCreateSchema } from "../schema/profile-create.schema";
import { profileUpdateSchema } from "../schema/profile-update.schema";

@injectable()
export default class ProfileRouter {
  private readonly router;
  constructor(
    @inject(TYPES.ProfileController)
    private readonly profileController: ProfileController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/",
      authenticateUser,
      validateRequestBody(profileCreateSchema),
      this.profileController.postProfile,
    );

    this.router.get(
      "/",
      authenticateUser,
      this.profileController.getProfile,
    );

    this.router.patch(
      "/",
      authenticateUser,
      validateRequestBody(profileUpdateSchema),
      this.profileController.patchProfile,
    );

    this.router.delete(
      "/",
      authenticateUser,
      this.profileController.deleteProfile,
    );
  }

  public getRouter() {
    return this.router;
  }
}
