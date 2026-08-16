import TYPES from "@/core/di/inversify.types";
import { inject, injectable } from "inversify";
import MovieRepository from "./repository/movie.repository";
import { Movie } from "./entity/movie.entity";
import { MovieNotFoundError } from "./error/errors";
import { GetMovieShowsDto } from "./dto/GetMovieShowsDto";
import { MovieShows } from "./entity/movie-shows.entity";

@injectable()
export default class MovieService {
  constructor(
    @inject(TYPES.MovieRepository) private readonly movieRepo: MovieRepository,
  ) {}

  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepo.listAll();
  }

  async getMovieById(id: string): Promise<Movie> {
    const movie = await this.movieRepo.findById(id);
    if (!movie) throw new MovieNotFoundError("Movie not found");

    return movie;
  }

  async getMovieShows(input: GetMovieShowsDto): Promise<MovieShows> {
    const { movieId, options } = input;

    const movie = await this.movieRepo.findById(movieId);
    if (!movie) throw new MovieNotFoundError("Movie not found");

    return this.movieRepo.findShowsByMovieId(movieId, options);
  }
}
