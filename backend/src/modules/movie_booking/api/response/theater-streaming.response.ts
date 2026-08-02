import { Movie } from "../../entity/movie.entity";
import { TheaterStreaming } from "../../entity/theater-streaming.entity";

export function buildStreamingTheatersForMovieResponse(
  movie: Movie,
  streamingTheaters: TheaterStreaming[],
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
