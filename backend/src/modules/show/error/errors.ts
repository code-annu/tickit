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

export class SeatHoldError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: StatusCode.Error.BAD_REQUEST,
      code: ShowErrorCode.SEAT_HOLD_ERROR,
    });
  }
}
