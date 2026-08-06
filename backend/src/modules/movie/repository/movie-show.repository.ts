import { inject, injectable } from "inversify";
import { prisma } from "@/core/prisma/prisma.client";
import { startOfDay, endOfDay } from "date-fns";
import TYPES from "@/core/di/inversify.types";
import MovieShowMapper from "../mapper/movie-show.mapper";
import { MovieShow } from "../entity/movie-show.entity";

@injectable()
export default class MovieShowRepository {
  private readonly db = prisma;

  constructor(
    @inject(TYPES.MovieShowMapper)
    private readonly mapper: MovieShowMapper,
  ) {}

  async findForMovie(
    movieId: string,
    options: { city: string; date: Date },
  ): Promise<MovieShow[]> {
    const shows = await this.db.show.findMany({
      where: {
        movieId,
        onDate: options.date,
        theater: {
          city: {
            equals: options.city,
            mode: "insensitive",
          },
        },
      },
      include: { theater: true },
      orderBy: { startTime: "asc" },
    });

    return this.mapper.toEntities(shows);
  }
}
