import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import AuthService from "../auth.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import { SignupDto } from "../dto/signup.dto";
import ClientInfoUtil from "@/shared/util/client-info.util";
import { REFRESH_TOKEN_COOKIE } from "@/config/cookie";
import { buildAuthResponse } from "./auth.response";
import { LoginDto } from "../dto/login.dto";
import { RefreshSessionDto } from "../dto/refresh-session.dto";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
    @inject(TYPES.ClientInfoUtil)
    private readonly clientInfoUtil: ClientInfoUtil,
  ) {}

  postSignup = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const input: SignupDto = {
        ...req.body,
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.signup(input);

      res.cookie(
        REFRESH_TOKEN_COOKIE.KEY,
        session.refreshToken,
        REFRESH_TOKEN_COOKIE.OPTIONS,
      );
      return res
        .status(201)
        .json(buildAuthResponse(session, "User signup successfully"));
    },
  );

  postLogin = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const input: LoginDto = {
        ...req.body,
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.login(input);

      res.cookie(
        REFRESH_TOKEN_COOKIE.KEY,
        session.refreshToken,
        REFRESH_TOKEN_COOKIE.OPTIONS,
      );
      return res
        .status(200)
        .json(buildAuthResponse(session, "User login successfully"));
    },
  );

  postRefreshSession = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const input: RefreshSessionDto = {
        token: req.cookies[REFRESH_TOKEN_COOKIE.KEY],
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.refreshSession(input);
      res.cookie(
        REFRESH_TOKEN_COOKIE.KEY,
        session.refreshToken,
        REFRESH_TOKEN_COOKIE.OPTIONS,
      );
      return res
        .status(200)
        .json(buildAuthResponse(session, "Refresh session successfully"));
    },
  );

  postLogout = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      await this.authService.logout(req.auth!.sid);
      res.clearCookie(REFRESH_TOKEN_COOKIE.KEY);
      return res.status(204).send();
    },
  );

  postLogoutAll = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      await this.authService.logoutAll(req.auth!.sub);
      res.clearCookie(REFRESH_TOKEN_COOKIE.KEY);
      return res.status(200).send();
    },
  );
}
