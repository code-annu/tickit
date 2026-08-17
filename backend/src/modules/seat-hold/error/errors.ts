import AppError from "@/core/error/AppError";
import StatusCode from "@/core/error/StatusCode";
import SeatHoldErrorCode from "./SeatHoldErrorCode";

export class SeatHoldError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: StatusCode.Error.BAD_REQUEST,
      code: SeatHoldErrorCode.SEAT_HOLD_ERROR,
    });
  }
}

export class SeatHoldNotFoundError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: StatusCode.Error.NOT_FOUND,
      code: SeatHoldErrorCode.SEAT_HOLD_NOT_FOUND,
    });
  }
}
