import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieBookingService from "../../domain/service/movie-booking.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import { buildStreamingTheaterSeatInventoryResponse } from "../response/theater-seat-inventory.response";

@injectable()
export default class MovieBookingController {
  constructor(
    @inject(TYPES.MovieBookingService)
    private readonly service: MovieBookingService,
  ) {}

  getStreamingTheaterSeatInventory = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { streamingId } = req.params;
      const seatInventory = await this.service.getStreamingTheaterSeatInventory(
        streamingId!.toString(),
      );

      return res
        .status(200)
        .json(
          buildStreamingTheaterSeatInventoryResponse(
            seatInventory,
            "Theater seat inventory fetched successfully",
          ),
        );
    },
  );
}
