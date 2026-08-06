import AppError from "../AppError";

export default class UnauthorizedError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 401,
      details: details,
    });
  }
}
