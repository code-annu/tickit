import { Movie } from "../../entity/movie.entity";

export function buildMovieResponse(movie: Movie, message: string) {
  return {
    success: true,
    message,
    data: movie,
  };
}

export function buildMoviesListResponse(movies: Movie[], message: string) {
  return {
    success: true,
    message,
    data: movies,
  };
}
