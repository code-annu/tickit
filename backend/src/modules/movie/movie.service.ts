import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import MovieRepository from "./repository/movie.repository";
import NotFoundError from "@/core/error/types/NotFoundError";
import MovieErrorCode from "./MovieErrorCode";
import { Movie } from "./entity/movie.entity";

@injectable()
export default class MovieService {
  constructor(
    @inject(TYPES.MovieRepository)
    private readonly movieRepository: MovieRepository,
  ) {}

  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepository.findAll();
  }

  async getMovieDetails(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundError(
        "Movie not found",
        MovieErrorCode.MOVIE_NOT_FOUND,
      );
    }
    return movie;
  }
}
