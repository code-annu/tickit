import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import SeatHoldService from "./seat-hold.service";
import SeatHoldResponse from "./seat-hold.response";
import StatusCode from "@/core/error/StatusCode";
import catchAsync from "@/core/error/async.catch";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class SeatHoldController {
  constructor(
    @inject(TYPES.SeatHoldService)
    private readonly service: SeatHoldService,
    @inject(TYPES.SeatHoldResponse)
    private readonly seatHoldResponse: SeatHoldResponse,
  ) {}

  public holdSeat = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.auth!.sub;
    const { showId, showSeatIds } = req.body;

    const seatHold = await this.service.holdSeat(userId, {
      showId,
      showSeatIds,
    });
    const response = this.seatHoldResponse.buildHoldSeatResponse(seatHold);
    res.status(StatusCode.Success.OK).json(response);
  });

  public getSeatHoldById = catchAsync(async (req: Request, res: Response) => {
    const seatHold = await this.service.getSeatHoldById(
      req.params.id!.toString(),
    );
    const response = this.seatHoldResponse.buildGetSeatHoldResponse(seatHold);
    res.status(StatusCode.Success.OK).json(response);
  });
}
