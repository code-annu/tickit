import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import TheaterService from "./theater.service";
import {
  buildTheaterResponse,
  buildTheatersListResponse,
  buildTheaterShowResponse,
} from "./theater.response";
import catchAsync from "@/core/error/async.catch";

@injectable()
export default class TheaterController {
  constructor(
    @inject(TYPES.TheaterService)
    private readonly theaterService: TheaterService,
  ) {}

  getCityTheaters = catchAsync(async (req: Request, res: Response) => {
    const city = req.query.city as string;
    const theaters = await this.theaterService.getCityTheaters(city);
    res
      .status(200)
      .json(
        buildTheatersListResponse(theaters, "Theaters fetched successfully"),
      );
  });

  getTheaterDetails = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const theater = await this.theaterService.getTheaterDetails(id);
    res
      .status(200)
      .json(
        buildTheaterResponse(theater, "Theater details fetched successfully"),
      );
  });

  getTheaterShows = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const date = new Date(req.query.date as string);

    const theater = await this.theaterService.getTheaterDetails(id);
    const shows = await this.theaterService.getTheaterShows({
      theaterId: id,
      options: { date },
    });

    res
      .status(200)
      .json(
        buildTheaterShowResponse(
          { theater, shows },
          "Theater shows fetched successfully",
        ),
      );
  });
}
