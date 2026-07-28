import AppError from "../AppError";

export default class ForbiddenError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 403,
      details: details,
    });
  }
}
