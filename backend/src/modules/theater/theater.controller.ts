import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import TheaterService from "./theater.service";
import TheaterResponse from "./theater.response";
import StatusCode from "@/core/error/StatusCode";
import catchAsync from "@/core/error/async.catch";

@injectable()
export default class TheaterController {
  constructor(
    @inject(TYPES.TheaterService) private readonly service: TheaterService,
    @inject(TYPES.TheaterResponse)
    private readonly theaterResponse: TheaterResponse,
  ) {}

  public getTheaterDetails = catchAsync(async (req: Request, res: Response) => {
    const theater = await this.service.getTheaterDetails(
      req.params.id!.toString(),
    );
    const response = this.theaterResponse.buildTheaterResponse(theater);

    res.status(StatusCode.Success.OK).json(response);
  });

  public getTheaterShows = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.query as { date: string };

    const theaterShows = await this.service.getTheaterShows({
      theaterId: id!.toString(),
      options: { date },
    });

    const response =
      this.theaterResponse.buildTheaterShowsResponse(theaterShows);

    res.status(StatusCode.Success.OK).json(response);
  });
}
