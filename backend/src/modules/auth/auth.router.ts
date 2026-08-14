import { Router } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import AuthController from "./auth.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import { SignupSchema } from "./schema/signup.schema";
import { LoginSchema } from "./schema/login.schema";
import { RefreshSessionSchema } from "./schema/refresh-session.schema";

@injectable()
export default class AuthRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.AuthController)
    private readonly controller: AuthController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/signup",
      validateRequest(SignupSchema),
      this.controller.signup,
    );

    this.router.post(
      "/login",
      validateRequest(LoginSchema),
      this.controller.login,
    );

    this.router.post(
      "/refresh",
      validateRequest(RefreshSessionSchema),
      this.controller.refreshSession,
    );

    this.router.post("/logout", authenticateUser, this.controller.logout);
  }
}
