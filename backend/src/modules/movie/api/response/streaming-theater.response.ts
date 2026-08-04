import { Movie } from "../../domain/entity/movie.entity";
import { StreamingTheater } from "../../domain/entity/streaming-theater.entity";

export function buildStreamingTheatersForMovieResponse(
  data: {
    movie: Movie;
    theaters: StreamingTheater[];
  },
  message: string,
) {
  return {
    success: true,
    message,
    data: {
      movie: data.movie,
      streamingTheaters: data.theaters,
      count: data.theaters.length,
    },
  };
}
