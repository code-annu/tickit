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

// export function buildMovieShowResponse(
//   data: MovieShow,
//   message: string,
// ) {
//   return { success: true, message, data };
// }
