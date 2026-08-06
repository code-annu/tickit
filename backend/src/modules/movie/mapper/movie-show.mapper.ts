import { injectable } from "inversify";
import { MovieShow } from "../entity/movie-show.entity";
import { Show, Theater } from "@/generated/prisma";

type ShowWithTheater = Show & { theater: Theater };

@injectable()
export default class MovieShowMapper {
  toEntity(show: ShowWithTheater): MovieShow {
    return {
      id: show.id,
      theater: {
        id: show.theater.id,
        name: show.theater.name,
        city: show.theater.city,
        address: show.theater.address,
        avatarUrl: show.theater.avatarUrl,
        rating: show.theater.rating,
      },
      onDate: show.onDate,
      startTime: show.startTime,
      onwardsPrice: Number(show.onwardAmount),
    };
  }

  toEntities(shows: ShowWithTheater[]): MovieShow[] {
    return shows.map((show) => this.toEntity(show));
  }
}
