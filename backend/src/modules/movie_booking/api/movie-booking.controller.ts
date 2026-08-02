import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieService from "../service/movie.service";
import TheaterStreamingService from "../service/theater-streaming.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import {
  buildMovieResponse,
  buildMoviesListResponse,
} from "./response/movie.response";
import { buildStreamingTheatersForMovieResponse } from "./response/theater-streaming.response";

@injectable()
export default class MovieBookingController {
  constructor(
    @inject(TYPES.MovieService) private readonly movieService: MovieService,
    @inject(TYPES.TheaterStreamingService)
    private readonly theaterStreamingService: TheaterStreamingService,
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
      const movie = await this.movieService.getMovieById(movieId!.toString());
      return res
        .status(200)
        .json(buildMovieResponse(movie, "Movie fetched successfully"));
    },
  );

  getStreamingTheatersForMovie = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { movieId } = req.params;
      const { city, date } = req.query;
      const movie = await this.movieService.getMovieById(movieId!.toString());
      const streamingTheaters =
        await this.theaterStreamingService.getTheatersForMovieInCity(
          movieId!.toString(),
          { city: city!.toString(), date: new Date(date!.toString()) },
        );
      return res
        .status(200)
        .json(
          buildStreamingTheatersForMovieResponse(
            movie,
            streamingTheaters,
            "Streaming theaters for movie fetched successfully",
          ),
        );
    },
  );
}
