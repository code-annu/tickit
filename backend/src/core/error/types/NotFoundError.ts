import AppError from "../AppError";

export default class NotFoundError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 404,
      details: details,
    });
  }
}
