import { injectable } from "inversify";
import {
  Movie as PrismaMovie,
  Show as PrismaShow,
  Theater as PrismaTheater,
} from "@/generated/prisma/client";
import { Movie } from "./entity/movie.entity";
import { MovieShows } from "./entity/movie-shows.entity";

type TheaterWithShows = PrismaTheater & { shows: PrismaShow[] };

@injectable()
export default class MovieMapper {
  toMovieEntity(movie: PrismaMovie): Movie {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      durationMin: movie.durationMin,
      language: movie.language,
      releaseDate: movie.releaseDate.toLocaleDateString(),
      posterUrl: movie.posterUrl,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    };
  }

  toMovieShowsEntity(
    movieId: string,
    onDate: string,
    theaters: TheaterWithShows[],
  ): MovieShows {
    return {
      movieId,
      onDate,
      theaters: theaters.map((theater) => ({
        id: theater.id,
        name: theater.name,
        city: theater.city,
        avatarUrl: theater.avatarUrl,
        address: theater.address,
        rating: theater.rating,
        shows: theater.shows.map((show) => ({
          id: show.id,
          startTime: show.startTime.toLocaleTimeString(),
          endTime: show.endTime.toLocaleTimeString(),
          basePrice: Number(show.basePrice),
        })),
      })),
    };
  }
}
