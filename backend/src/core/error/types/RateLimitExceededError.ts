import AppError from "../AppError";
import ErrorCode from "../ErrorCode";

export default class RateLimitExceededError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      statusCode: 429,
      details: details,
    });
  }
}
