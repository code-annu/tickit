import TYPES from "@/di/inversify.types";
import { Router } from "express";
import { inject, injectable } from "inversify";
import MovieBookingController from "./movie-booking.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetStreamingTheatersForMovieSchema } from "../schema/GetStreamingTheatersForMovieSchema";
import { GetMovieByIdSchema } from "../schema/GetMovieByIdSchema";

@injectable()
export default class MovieBookingRouter {
  private readonly router;
  constructor(
    @inject(TYPES.MovieBookingController)
    private readonly movieBookingController: MovieBookingController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get("/", this.movieBookingController.getStreamingMovies);
    this.router.get(
      "/:movieId",
      validateRequest({ params: GetMovieByIdSchema.params }),
      this.movieBookingController.getMovieById,
    );
    this.router.get(
      "/:movieId/streaming-theaters",
      validateRequest({
        params: GetStreamingTheatersForMovieSchema.params,
        query: GetStreamingTheatersForMovieSchema.query,
      }),
      this.movieBookingController.getStreamingTheatersForMovie,
    );
  }

  public getRouter() {
    return this.router;
  }
}
