import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieService from "../service/movie.service";
import TheaterService from "../service/theater.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import {
  buildMovieResponse,
  buildMoviesListResponse,
} from "./response/movie.response";
import BadRequestError from "@/shared/error/types/BadRequestError";
import ErrorCode from "@/shared/error/ErrorCode";

@injectable()
export default class MovieBookingController {
  constructor(
    @inject(TYPES.MovieService) private readonly movieService: MovieService,
    @inject(TYPES.TheaterService)
    private readonly theaterService: TheaterService,
  ) {}

  getStreamingMovies = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const movies = await this.movieService.getStreamingMovies();
      return res
        .status(200)
        .json(
          buildMoviesListResponse(
            movies,
            "Streaming movies fetched successfully",
          ),
        );
    },
  );

  getMovieById = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { movieId } = req.params;
      if (!movieId) {
        throw new BadRequestError(
          "Movie id is required in params",
          ErrorCode.INVALID_REQUEST,
        );
      }
      const movie = await this.movieService.getMovieById(movieId.toString());
      return res
        .status(200)
        .json(buildMovieResponse(movie, "Movie fetched successfully"));
    },
  );
}
