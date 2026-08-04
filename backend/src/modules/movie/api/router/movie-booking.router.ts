import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieBookingController from "../controller/movie-booking.controller";
import { Router } from "express";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetStreamingTheaterSeatInventorySchema } from "../schema/GetStreamingTheaterSeatInventorySchema";

@injectable()
export default class MovieBookingRouter {
  private readonly router;
  constructor(
    @inject(TYPES.MovieBookingController)
    private readonly controller: MovieBookingController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      "/streaming-theaters/:streamingId/seats",
      authenticateUser,
      validateRequest(GetStreamingTheaterSeatInventorySchema),
      this.controller.getStreamingTheaterSeatInventory,
    );
  }

  public getRouter() {
    return this.router;
  }
}
