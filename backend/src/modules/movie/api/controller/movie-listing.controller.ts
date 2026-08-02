import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieListingService from "../../domain/service/movie-listing.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import {
  buildMovieListingsResponse,
  buildMovieResponse,
} from "../response/movie.response";
import { buildStreamingTheatersForMovieResponse } from "../response/streaming-theater.response";

@injectable()
export default class MovieListingController {
  constructor(
    @inject(TYPES.MovieListingService)
    private readonly service: MovieListingService,
  ) {}

  getMovieListings = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const movies = await this.service.getMovieListings();
      const response = buildMovieListingsResponse(
        movies,
        movies.length > 0
          ? "Movie listings retrieved successfully"
          : "Currently no movies are listed",
      );
      return res.status(200).json(response);
    },
  );

  getMovieById = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { movieId } = req.params;
      const movie = await this.service.getMovieById(movieId!.toString());
      const response = buildMovieResponse(
        movie,
        "Movie details retrieved successfully",
      );
      return res.status(200).json(response);
    },
  );

  getStreamingTheatersForMovie = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { movieId } = req.params;
      const { city, date } = req.query;
      const movie = await this.service.getMovieById(movieId!.toString());
      const theaters = await this.service.getStreamingTheatersForMovie(
        movie.id,
        { city: city as string, date: new Date(date as string) },
      );
      const response = buildStreamingTheatersForMovieResponse(
        { movie, theaters },
        theaters.length > 0
          ? `Streaming theaters for ${movie.title} retrieved successfully`
          : `Currently no theaters are streaming ${movie.title} on ${date as string} in ${city as string}`,
      );
      return res.status(200).json(response);
    },
  );
}
