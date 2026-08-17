import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import ShowService from "./show.service";
import ShowResponse from "./show.response";
import StatusCode from "@/core/error/StatusCode";
import catchAsync from "@/core/error/async.catch";

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
}
