import { validateRequestBody } from "@/shared/middleware/validate-request-body.middleware";
import { Router } from "express";
import { inject, injectable } from "inversify";
import { signupSchema } from "../schema/signup.schema";
import AuthController from "./auth.controller";
import TYPES from "@/di/inversify.types";
import { loginSchema } from "../schema/login.schema";
import authenticateUser from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class AuthRouter {
  private readonly router;
  constructor(
    @inject(TYPES.AuthController)
    private readonly authController: AuthController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/signup",
      validateRequestBody(signupSchema),
      this.authController.postSignup,
    );
    this.router.post(
      "/login/",
      validateRequestBody(loginSchema),
      this.authController.postLogin,
    );

    this.router.post(
      "/refresh-session",
      this.authController.postRefreshSession,
    );
    this.router.post(
      "/logout",
      authenticateUser,
      this.authController.postLogout,
    );
    /*this.router.post(
      "/logout-all",
      authenticateUser,
      this.authController.postLogoutAll,
    );*/
  }

  public getRouter() {
    return this.router;
  }
}
