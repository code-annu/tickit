import { injectable } from "inversify";
import { TheaterShow } from "../entity/theater-show.entity";
import { Show, Movie } from "@/generated/prisma";

type ShowWithMovie = Show & { movie: Movie };

@injectable()
export default class TheaterShowMapper {
  toEntity(show: ShowWithMovie): TheaterShow {
    return {
      id: show.id,
      movie: {
        id: show.movie.id,
        title: show.movie.title,
        posterUrl: show.movie.posterUrl,
        language: show.movie.language,
      },
      onDate: show.onDate,
      startTime: show.startTime,
      onwardsAmount: Number(show.onwardAmount),
      createdAt: show.createdAt,
      updatedAt: show.updatedAt,
    };
  }

  toEntities(shows: ShowWithMovie[]): TheaterShow[] {
    return shows.map((show) => this.toEntity(show));
  }
}
