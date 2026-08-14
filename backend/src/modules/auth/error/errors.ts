import AppError from "@/core/error/AppError";
import StatusCode from "@/core/error/StatusCode";
import AuthErrorCode from "./AuthErrorCode";

export class EmailAlreadyExists extends AppError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.Error.CONFLICT,
      message,
      code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
    });
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.Error.UNAUTHORIZED,
      message,
      code: AuthErrorCode.INVALID_CREDENTIALS,
    });
  }
}

export class MissingRefreshTokenError extends AppError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.Error.UNAUTHORIZED,
      message,
      code: AuthErrorCode.MISSING_REFRESH_TOKEN,
    });
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.Error.UNAUTHORIZED,
      message,
      code: AuthErrorCode.INVALID_REFRESH_TOKEN,
    });
  }
}

export class ExpiredRefreshTokenError extends AppError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.Error.UNAUTHORIZED,
      message,
      code: AuthErrorCode.EXPIRED_REFRESH_TOKEN,
    });
  }
}

export class RevokedRefreshTokenError extends AppError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.Error.UNAUTHORIZED,
      message,
      code: AuthErrorCode.REVOKED_REFRESH_TOKEN,
    });
  }
}

