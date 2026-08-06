import AppError from "../AppError";

export default class UnprocessableEntityError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super({
      code,
      message,
      statusCode: 422,
      details: details,
    });
  }
}
