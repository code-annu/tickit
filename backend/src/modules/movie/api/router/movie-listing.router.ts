import { Router } from "express";
import { inject, injectable } from "inversify";
import MovieListingController from "../controller/movie-listing.controller";
import TYPES from "@/di/inversify.types";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetMovieByIdSchema } from "../schema/GetMovieByIdSchema";
import { GetStreamingTheatersForMovieSchema } from "../schema/GetStreamingTheatersForMovieSchema";

@injectable()
export default class MovieListingRouter {
  private readonly router: Router;
  constructor(
    @inject(TYPES.MovieListingController)
    private readonly controller: MovieListingController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get("/", this.controller.getMovieListings);
    this.router.get(
      "/:movieId",
      validateRequest(GetMovieByIdSchema),
      this.controller.getMovieById,
    );
    this.router.get(
      "/:movieId/streaming-theaters",
      validateRequest(GetStreamingTheatersForMovieSchema),
      this.controller.getStreamingTheatersForMovie,
    );
  }

  public getRouter() {
    return this.router;
  }
}
