import { Movie } from "../../entity/movie.entity";
import { StreamingTheater } from "../../entity/streaming-theater.entity";

export function buildStreamingTheatersForMovieResponse(
  movie: Movie,
  streamingTheaters: StreamingTheater[],
  message: string,
) {
  return {
    success: true,
    message,
    data: {
      movie,
      theaters: streamingTheaters,
      theatersCount: streamingTheaters.length,
    },
  };
}
