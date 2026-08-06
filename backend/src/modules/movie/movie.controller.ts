import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import MovieService from "./movie.service";
import {
  buildMovieResponse,
  buildMoviesListResponse,
} from "./movie.response";
import catchAsync from "@/core/error/async.catch";

@injectable()
export default class MovieController {
  constructor(
    @inject(TYPES.MovieService)
    private readonly movieService: MovieService,
  ) {}

  getAllMovies = catchAsync(async (_req: Request, res: Response) => {
    const movies = await this.movieService.getAllMovies();
    res.status(200).json(buildMoviesListResponse(movies, "Movies fetched successfully"));
  });

  getMovieDetails = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const movie = await this.movieService.getMovieDetails(id!);
    res.status(200).json(buildMovieResponse(movie, "Movie details fetched successfully"));
  });
}
