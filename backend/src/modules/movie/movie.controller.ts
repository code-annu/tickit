import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import TYPES from "@/core/di/inversify.types";
import MovieService from "./movie.service";
import MovieResponse from "./movie.response";
import StatusCode from "@/core/error/StatusCode";
import catchAsync from "@/core/error/async.catch";

@injectable()
export default class MovieController {
  constructor(
    @inject(TYPES.MovieService) private readonly service: MovieService,
    @inject(TYPES.MovieResponse) private readonly movieResponse: MovieResponse,
  ) {}

  public getAllMovies = catchAsync(async (_req: Request, res: Response) => {
    const movies = await this.service.getAllMovies();
    const response = this.movieResponse.buildMovieListResponse(movies);

    res.status(StatusCode.Success.OK).json(response);
  });

  public getMovieById = catchAsync(async (req: Request, res: Response) => {
    const movie = await this.service.getMovieById(req.params.id!.toString());
    const response = this.movieResponse.buildMovieResponse(movie);

    res.status(StatusCode.Success.OK).json(response);
  });

  public getMovieShows = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { city, date } = req.query as { city: string; date: string };

    const movieShows = await this.service.getMovieShows({
      movieId: id!.toString(),
      options: { city, date },
    });

    const response = this.movieResponse.buildMovieShowsResponse(movieShows);

    res.status(StatusCode.Success.OK).json(response);
  });
}
