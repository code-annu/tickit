import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { Router } from "express";
import { inject, injectable } from "inversify";
import ProfileController from "./profile.controller";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import TYPES from "@/core/di/inversify.types";
import { profileCreateSchema } from "./schema/profile-create.schema";
import { profileUpdateSchema } from "./schema/profile-update.schema";

@injectable()
export default class ProfileRouter {
  public readonly router: Router;
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
      validateRequest({ body: profileCreateSchema }),
      this.profileController.postProfile,
    );

    this.router.get("/", authenticateUser, this.profileController.getProfile);

    this.router.patch(
      "/",
      authenticateUser,
      validateRequest({ body: profileUpdateSchema }),
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
