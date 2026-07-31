import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieRepository from "../repository/movie.repository";
import { Movie } from "../entity/movie.entity";
import NotFoundError from "@/shared/error/types/NotFoundError";
import MovieErrorCode from "../errors/MovieErrorCode";

@injectable()
export default class MovieService {
  constructor(
    @inject(TYPES.MovieRepository)
    private readonly movieRepo: MovieRepository,
  ) {}

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

  async getStreamingMovies(): Promise<Movie[]> {
    return this.movieRepo.listStreamings();
  }
}
