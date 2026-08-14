import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import AuthService from "./auth.service";
import AuthResponse from "./auth.response";
import ClientInfoUtil from "@/shared/util/client-info.util";
import StatusCode from "@/core/error/StatusCode";
import catchAsync from "@/core/error/async.catch";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";
import { REFRESH_TOKEN_COOKIE } from "@/core/config/cookie";

@injectable()
export default class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly service: AuthService,
    @inject(TYPES.AuthResponse) private readonly authResponse: AuthResponse,
    @inject(TYPES.ClientInfoUtil)
    private readonly clientInfoUtil: ClientInfoUtil,
  ) {}

  public signup = catchAsync(async (req: Request, res: Response) => {
    const client = this.clientInfoUtil.getClientInfo(req);
    const session = await this.service.signup({ ...req.body, client });

    const response = this.authResponse.buildAuthResponse(session);

    res
      .status(StatusCode.Success.CREATED)
      .cookie(
        REFRESH_TOKEN_COOKIE.KEY,
        session.refreshToken,
        REFRESH_TOKEN_COOKIE.OPTIONS,
      )
      .json(response);
  });

  public login = catchAsync(async (req: Request, res: Response) => {
    const client = this.clientInfoUtil.getClientInfo(req);
    const session = await this.service.login({ ...req.body, client });

    const response = this.authResponse.buildAuthResponse(session);
    res
      .status(StatusCode.Success.OK)
      .cookie(
        REFRESH_TOKEN_COOKIE.KEY,
        session.refreshToken,
        REFRESH_TOKEN_COOKIE.OPTIONS,
      )
      .json(response);
  });

  public refreshSession = catchAsync(async (req: Request, res: Response) => {
    const client = this.clientInfoUtil.getClientInfo(req);
    const token = req.cookies?.refreshToken ?? req.body?.token;
    const session = await this.service.refreshSession({ token, client });

    const response = this.authResponse.buildAuthResponse(session);
    res
      .status(StatusCode.Success.OK)
      .cookie(
        REFRESH_TOKEN_COOKIE.KEY,
        session.refreshToken,
        REFRESH_TOKEN_COOKIE.OPTIONS,
      )
      .json(response);
  });

  public logout = catchAsync(async (req: AuthRequest, res: Response) => {
    const sessionId = req.auth!.sid;
    await this.service.logout(sessionId);

    res
      .status(StatusCode.Success.NO_CONTENT)
      .clearCookie(REFRESH_TOKEN_COOKIE.KEY, {
        path: REFRESH_TOKEN_COOKIE.OPTIONS.path,
      })
      .send();
  });
}
