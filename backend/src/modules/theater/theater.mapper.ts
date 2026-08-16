import { injectable } from "inversify";
import {
  Movie as PrismaMovie,
  Show as PrismaShow,
  Theater as PrismaTheater,
} from "@/generated/prisma/client";
import { Theater } from "./entity/theater.entity";
import { TheaterShows } from "./entity/theater-shows.entity";

type MovieWithShows = PrismaMovie & { shows: PrismaShow[] };

@injectable()
export default class TheaterMapper {
  toTheaterEntity(theater: PrismaTheater): Theater {
    return {
      id: theater.id,
      name: theater.name,
      city: theater.city,
      address: theater.address,
      rating: theater.rating,
      avatarUrl: theater.avatarUrl,
      seatingCapacity: theater.seatingCapacity,
      createdAt: theater.createdAt,
      updatedAt: theater.updatedAt,
    };
  }

  toTheaterShowsEntity(
    theaterId: string,
    onDate: string,
    movies: MovieWithShows[],
  ): TheaterShows {
    return {
      theaterId,
      onDate,
      movies: movies.map((movie) => ({
        movieId: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        language: movie.language,
        shows: movie.shows.map((show) => ({
          id: show.id,
          startTime: show.startTime.toLocaleTimeString(),
          endTime: show.endTime.toLocaleTimeString(),
          basePrice: Number(show.basePrice),
        })),
      })),
    };
  }
}
