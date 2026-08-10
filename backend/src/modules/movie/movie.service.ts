import { inject, injectable } from "inversify";
import TYPES from "@/core/di/inversify.types";
import MovieRepository from "./repository/movie.repository";
import MovieShowRepository from "./repository/movie-show.repository";
import NotFoundError from "@/core/error/types/NotFoundError";
import MovieErrorCode from "./MovieErrorCode";
import { Movie } from "./entity/movie.entity";
import { MovieShow } from "./entity/movie-show.entity";
import { GetMovieShowsDto } from "./dto/GetMovieShowsDto";

@injectable()
export default class MovieService {
  constructor(
    @inject(TYPES.MovieRepository)
    private readonly movieRepository: MovieRepository,
    @inject(TYPES.MovieShowRepository)
    private readonly movieShowRepository: MovieShowRepository,
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

  async getMovieShows(input: GetMovieShowsDto): Promise<MovieShow[]> {
    return this.movieShowRepository.findForMovie(input.movieId, input.options);
  }
}
