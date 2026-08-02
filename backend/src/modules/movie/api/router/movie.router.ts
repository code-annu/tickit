import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieListingRouter from "./movie-listing.router";
import { Router } from "express";

@injectable()
export default class MovieRouter {
  private readonly router;

  constructor(
    @inject(TYPES.MovieListingRouter)
    private readonly movieListingRouter: MovieListingRouter,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.use("/listings", this.movieListingRouter.getRouter());
  }

  public getRouter() {
    return this.router;
  }
}
