import AppError from "@/core/error/AppError";
import TheaterErrorCode from "./TheaterErrorCode";
import StatusCode from "@/core/error/StatusCode";

export class TheaterNotFoundError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: StatusCode.Error.NOT_FOUND,
      code: TheaterErrorCode.THEATER_NOT_FOUND,
    });
  }
}
