import { injectable } from "inversify";
import { Movie } from "./entity/movie.entity";
import { MovieShows } from "./entity/movie-shows.entity";

@injectable()
export default class MovieResponse {
  buildMovieListResponse(movies: Movie[]) {
    const movieList = movies.map((movie) => {
      return {
        id: movie.id,
        title: movie.title,
        durationMin: movie.durationMin,
        language: movie.language,
        releaseDate: movie.releaseDate,
        posterUrl: movie.posterUrl,
      };
    });

    return {
      data: { movies: movieList, totalMovies: movieList.length },
    };
  }

  buildMovieResponse(movie: Movie) {
    return {
      data: {
        id: movie.id,
        title: movie.title,
        durationMin: movie.durationMin,
        language: movie.language,
        releaseDate: movie.releaseDate,
        posterUrl: movie.posterUrl,
        overview: movie.overview,
      },
    };
  }

  buildMovieShowsResponse(movieShows: MovieShows) {
    

    return {
      data: movieShows,
    };
  }
}
