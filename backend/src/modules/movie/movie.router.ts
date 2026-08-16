import { Router } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import MovieController from "./movie.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetMovieDetailsSchema } from "./schema/GetMovieDetailsSchema";
import { GetMovieShowsSchema } from "./schema/GetMovieShowsSchema";

@injectable()
export default class MovieRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.MovieController)
    private readonly controller: MovieController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get("/", this.controller.getAllMovies);

    this.router.get(
      "/:id",
      validateRequest(GetMovieDetailsSchema),
      this.controller.getMovieById,
    );

    this.router.get(
      "/:id/shows",
      validateRequest(GetMovieShowsSchema),
      this.controller.getMovieShows,
    );
  }
}
