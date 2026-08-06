import { MovieShow } from "./entity/movie-show.entity";
import { Movie } from "./entity/movie.entity";

export function buildMovieResponse(data: Movie, message: string) {
  return { success: true, message, data };
}

export function buildMoviesListResponse(data: Movie[], message: string) {
  return {
    success: true,
    message,
    data: {
      movies: data,
      totalMovies: data.length,
    },
  };
}

export function buildMovieShowsResponse(
  data: { movie: Movie; shows: MovieShow[] },
  message: string,
) {
  return { success: true, message, data };
}
