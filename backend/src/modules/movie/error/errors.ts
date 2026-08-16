import AppError from "@/core/error/AppError";
import MovieErrorCode from "./MovieErrorCode";
import StatusCode from "@/core/error/StatusCode";

export class MovieNotFoundError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: StatusCode.Error.NOT_FOUND,
      code: MovieErrorCode.MOVIE_NOT_FOUND,
    });
  }
}
