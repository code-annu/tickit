import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieListingRouter from "./movie-listing.router";
import { Router } from "express";
import MovieBookingRouter from "./movie-booking.router";

@injectable()
export default class MovieRouter {
  private readonly router;

  constructor(
    @inject(TYPES.MovieListingRouter)
    private readonly movieListingRouter: MovieListingRouter,
    @inject(TYPES.MovieBookingRouter)
    private readonly movieBookingRouter: MovieBookingRouter,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.use("/listings", this.movieListingRouter.getRouter());
    this.router.use("/bookings", this.movieBookingRouter.getRouter());
  }

  public getRouter() {
    return this.router;
  }
}
