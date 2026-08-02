import { Movie } from "../../domain/entity/movie.entity";

export function buildMovieResponse(data: Movie, message: string) {
  return {
    success: true,
    message,
    data,
  };
}

export function buildMovieListingsResponse(data: Movie[], message: string) {
  return {
    success: true,
    message,
    data: { movies: data, moviesCount: data.length },
  };
}
