import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieRepository from "../../data/repository/movie.repository";
import { Movie } from "../entity/movie.entity";
import NotFoundError from "@/shared/error/types/NotFoundError";
import MovieErrorCode from "../errors/MovieErrorCode";
import { StreamingTheater } from "../entity/streaming-theater.entity";
import StreamingTheaterRepository from "../../data/repository/streaming-theater.repository";

@injectable()
export default class MovieListingService {
  constructor(
    @inject(TYPES.MovieRepository) private readonly movieRepo: MovieRepository,
    @inject(TYPES.StreamingTheaterRepository)
    private readonly streamingTheaterRepo: StreamingTheaterRepository,
  ) {}

  async getMovieListings(): Promise<Movie[]> {
    return await this.movieRepo.list();
  }

  async getMovieById(id: string): Promise<Movie> {
    const movie = await this.movieRepo.findById(id);
    if (!movie) {
      throw new NotFoundError(
        "Movie not found",
        MovieErrorCode.MOVIE_NOT_FOUND,
      );
    }
    return movie;
  }

  async getStreamingTheatersForMovie(
    movieId: string,
    options: { city: string; date: Date },
  ): Promise<StreamingTheater[]> {
    return await this.streamingTheaterRepo.listTheatersForMovie(
      movieId,
      options,
    );
  }
}
