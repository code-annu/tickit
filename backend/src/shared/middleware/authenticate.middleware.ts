import { NextFunction, Request, Response } from "express";
import JWTUtil, { JWTPayload } from "../util/jwt.util";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import UnauthorizedError from "@/core/error/types/UnAuthorizedError";

export interface AuthRequest extends Request {
  auth?: JWTPayload;
}

const jwtUtil = new JWTUtil();

export default function authenticateUser(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError(
      "Authorization token is required",
      AuthErrorCode.MISSING_ACCESS_TOKEN,
    );
  }
  const token = authHeader.substring("Bearer ".length).trim();
  try {
    const payload = jwtUtil.verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError(
      "Invalid or expired token",
      AuthErrorCode.INVALID_ACCESS_TOKEN,
    );
  }
}
