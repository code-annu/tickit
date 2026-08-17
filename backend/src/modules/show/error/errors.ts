import AppError from "@/core/error/AppError";
import StatusCode from "@/core/error/StatusCode";
import ShowErrorCode from "./ShowErrorCode";

export class ShowNotFoundError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: StatusCode.Error.NOT_FOUND,
      code: ShowErrorCode.SHOW_NOT_FOUND,
    });
  }
}
