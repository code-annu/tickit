import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import ShowService from "./show.service";
import ShowResponse from "./show.response";
import StatusCode from "@/core/error/StatusCode";
import catchAsync from "@/core/error/async.catch";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class ShowController {
  constructor(
    @inject(TYPES.ShowService) private readonly service: ShowService,
    @inject(TYPES.ShowResponse)
    private readonly showResponse: ShowResponse,
  ) {}

  public getShowDetails = catchAsync(async (req: Request, res: Response) => {
    const show = await this.service.getShowDetails(req.params.id!.toString());
    const response = this.showResponse.buildShowResponse(show);

    res.status(StatusCode.Success.OK).json(response);
  });

  public getShowSeatMap = catchAsync(async (req: Request, res: Response) => {
    const seatMap = await this.service.getShowSeatMap(
      req.params.id!.toString(),
    );
    const response = this.showResponse.buildShowSeatMapResponse(seatMap);
    res.status(StatusCode.Success.OK).json(response);
  });

  public holdShowSeats = catchAsync(
    async (req: AuthRequest, res: Response) => {
      const userId = req.auth!.sub;
      const showId = req.params.id!.toString();
      const { showSeatIds } = req.body;

      const seatHold = await this.service.holdShowSeats(userId, {
        showId,
        showSeatIds,
      });
      const response = this.showResponse.buildHoldShowSeatsResponse(seatHold);
      res.status(StatusCode.Success.OK).json(response);
    },
  );
}
