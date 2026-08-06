import AppError from "../AppError";

export default class BadRequestError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 400,
      details: details,
    });
  }
}
