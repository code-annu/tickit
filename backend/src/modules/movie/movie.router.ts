import { inject, injectable } from "inversify";
import { Router } from "express";
import TYPES from "@/core/di/inversify.types";
import MovieController from "./movie.controller";
import { validateRequest } from "@/shared/middleware/validate-request.middleware";
import { GetMovieDetailsSchema } from "./schema/GetMovieDetailsSchema";

@injectable()
export default class MovieRouter {
  public readonly router: Router;

  constructor(
    @inject(TYPES.MovieController)
    private readonly movieController: MovieController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.movieController.getAllMovies);
    this.router.get(
      "/:id",
      validateRequest(GetMovieDetailsSchema),
      this.movieController.getMovieDetails,
    );
  }
}
