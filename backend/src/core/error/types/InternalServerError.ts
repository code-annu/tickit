import AppError from "../AppError";

export default class InternalServerError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 500,
      isOperational: false,
      details: details,
    });
  }
}
