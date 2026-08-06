import AppError from "../AppError";

export default class ConflictError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 409,
      details: details,
    });
  }
}
