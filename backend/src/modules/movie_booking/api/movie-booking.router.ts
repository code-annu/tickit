import TYPES from "@/di/inversify.types";
import { Router } from "express";
import { inject, injectable } from "inversify";
import MovieBookingController from "./movie-booking.controller";

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
    this.router.get("/:movieId", this.movieBookingController.getMovieById);
  }

  public getRouter() {
    return this.router;
  }
}

//streaming-movies
